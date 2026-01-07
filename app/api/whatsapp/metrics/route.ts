import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"

// GET WhatsApp metrics and logs (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "summary" // summary, logs, metrics
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const limit = Number.parseInt(searchParams.get("limit") || "100")

    // Build date filter
    const dateFilter = []
    if (startDate) {
      dateFilter.push(`created_at >= '${startDate}'`)
    }
    if (endDate) {
      dateFilter.push(`created_at <= '${endDate}'`)
    }
    const dateCondition = dateFilter.length > 0 ? `WHERE ${dateFilter.join(" AND ")}` : ""

    if (type === "summary") {
      // Get overall metrics summary
      const metrics = await getMetricsSummary(dateCondition)
      return NextResponse.json(metrics)
    }

    if (type === "logs") {
      // Get recent WhatsApp logs
      const logs = await db`
        SELECT *
        FROM whatsapp_logs
        ${dateCondition ? db.unsafe(dateCondition) : db``}
        ORDER BY created_at DESC
        LIMIT ${limit}
      `
      return NextResponse.json({ logs })
    }

    if (type === "metrics") {
      // Get detailed metrics
      const metrics = await getDetailedMetrics(dateCondition)
      return NextResponse.json(metrics)
    }

    return NextResponse.json({ error: "Invalid type parameter" }, { status: 400 })
  } catch (error) {
    console.error("WhatsApp metrics error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Get metrics summary
async function getMetricsSummary(dateCondition: string) {
  try {
    // Total messages
    const totalMessages = await db`
      SELECT COUNT(*) as count
      FROM whatsapp_logs
      ${dateCondition ? db.unsafe(dateCondition) : db``}
    `

    // Messages by direction
    const messagesByDirection = await db`
      SELECT 
        direction,
        COUNT(*) as count
      FROM whatsapp_logs
      ${dateCondition ? db.unsafe(dateCondition) : db``}
      GROUP BY direction
    `

    // Messages by event type
    const messagesByEventType = await db`
      SELECT 
        event_type,
        COUNT(*) as count
      FROM whatsapp_logs
      ${dateCondition ? db.unsafe(dateCondition) : db``}
      GROUP BY event_type
      ORDER BY count DESC
    `

    // Order-related events
    const orderEvents = await db`
      SELECT 
        event_type,
        COUNT(*) as count
      FROM whatsapp_logs
      WHERE event_type IN ('order_created', 'order_status_notification')
      ${dateCondition ? db.unsafe(`AND ${dateCondition.replace("WHERE ", "")}`) : db``}
      GROUP BY event_type
    `

    // Average response time (time between inbound and outbound messages)
    const responseTimeQuery = await db`
      SELECT 
        AVG(
          EXTRACT(EPOCH FROM (
            SELECT MIN(wl2.created_at)
            FROM whatsapp_logs wl2
            WHERE wl2.direction = 'outbound'
            AND wl2.to_number = wl1.from_number
            AND wl2.created_at > wl1.created_at
          ) - wl1.created_at)
        ) as avg_response_seconds
      FROM whatsapp_logs wl1
      WHERE wl1.direction = 'inbound'
      ${dateCondition ? db.unsafe(`AND ${dateCondition.replace("WHERE ", "")}`) : db``}
    `

    // Messages by status
    const messagesByStatus = await db`
      SELECT 
        status,
        COUNT(*) as count
      FROM whatsapp_logs
      ${dateCondition ? db.unsafe(dateCondition) : db``}
      GROUP BY status
    `

    // Daily message volume
    const dailyVolume = await db`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM whatsapp_logs
      ${dateCondition ? db.unsafe(dateCondition) : db``}
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 30
    `

    return {
      summary: {
        totalMessages: totalMessages[0]?.count || 0,
        averageResponseTime: Math.round(responseTimeQuery[0]?.avg_response_seconds || 0),
        orderCreated: orderEvents.find((e) => e.event_type === "order_created")?.count || 0,
        notificationsSent:
          orderEvents.find((e) => e.event_type === "order_status_notification")?.count || 0,
      },
      byDirection: messagesByDirection,
      byEventType: messagesByEventType,
      byStatus: messagesByStatus,
      dailyVolume,
    }
  } catch (error) {
    console.error("Error getting metrics summary:", error)
    throw error
  }
}

// Get detailed metrics
async function getDetailedMetrics(dateCondition: string) {
  try {
    // Customer engagement metrics
    const topCustomers = await db`
      SELECT 
        from_number,
        COUNT(*) as message_count,
        MAX(created_at) as last_contact
      FROM whatsapp_logs
      WHERE direction = 'inbound'
      ${dateCondition ? db.unsafe(`AND ${dateCondition.replace("WHERE ", "")}`) : db``}
      GROUP BY from_number
      ORDER BY message_count DESC
      LIMIT 20
    `

    // Peak hours analysis
    const peakHours = await db`
      SELECT 
        EXTRACT(HOUR FROM created_at) as hour,
        COUNT(*) as count
      FROM whatsapp_logs
      ${dateCondition ? db.unsafe(dateCondition) : db``}
      GROUP BY hour
      ORDER BY hour
    `

    // Message delivery success rate
    const deliveryStats = await db`
      SELECT 
        status,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
      FROM whatsapp_logs
      WHERE direction = 'outbound'
      ${dateCondition ? db.unsafe(`AND ${dateCondition.replace("WHERE ", "")}`) : db``}
      GROUP BY status
    `

    // Order conversion rate (orders created via WhatsApp)
    const whatsappOrders = await db`
      SELECT COUNT(*) as count
      FROM orders
      WHERE payment_method = 'whatsapp'
      ${dateCondition ? db.unsafe(`AND ${dateCondition.replace("WHERE ", "")}`) : db``}
    `

    const whatsappInquiries = await db`
      SELECT COUNT(*) as count
      FROM whatsapp_logs
      WHERE event_type = 'general_inquiry'
      ${dateCondition ? db.unsafe(`AND ${dateCondition.replace("WHERE ", "")}`) : db``}
    `

    const conversionRate =
      whatsappInquiries[0]?.count > 0
        ? ((whatsappOrders[0]?.count / whatsappInquiries[0]?.count) * 100).toFixed(2)
        : 0

    return {
      customerEngagement: {
        topCustomers,
        totalUniqueCustomers: topCustomers.length,
      },
      peakHours,
      delivery: {
        stats: deliveryStats,
        successRate:
          deliveryStats.find((s) => s.status === "delivered")?.percentage || 0,
      },
      conversion: {
        orders: whatsappOrders[0]?.count || 0,
        inquiries: whatsappInquiries[0]?.count || 0,
        rate: conversionRate,
      },
    }
  } catch (error) {
    console.error("Error getting detailed metrics:", error)
    throw error
  }
}

// Export metrics as CSV (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { startDate, endDate } = await request.json()

    const dateFilter = []
    if (startDate) {
      dateFilter.push(`created_at >= '${startDate}'`)
    }
    if (endDate) {
      dateFilter.push(`created_at <= '${endDate}'`)
    }
    const dateCondition = dateFilter.length > 0 ? `WHERE ${dateFilter.join(" AND ")}` : ""

    const logs = await db`
      SELECT 
        event_type,
        message_id,
        from_number,
        to_number,
        message_body,
        direction,
        status,
        created_at
      FROM whatsapp_logs
      ${dateCondition ? db.unsafe(dateCondition) : db``}
      ORDER BY created_at DESC
    `

    // Convert to CSV
    const headers = [
      "Date",
      "Event Type",
      "Message ID",
      "From",
      "To",
      "Message",
      "Direction",
      "Status",
    ]
    const csvRows = [headers.join(",")]

    for (const log of logs) {
      const row = [
        new Date(log.created_at).toISOString(),
        log.event_type || "",
        log.message_id || "",
        log.from_number || "",
        log.to_number || "",
        `"${(log.message_body || "").replace(/"/g, '""')}"`,
        log.direction || "",
        log.status || "",
      ]
      csvRows.push(row.join(","))
    }

    const csv = csvRows.join("\n")

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="whatsapp-logs-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error("Export metrics error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
