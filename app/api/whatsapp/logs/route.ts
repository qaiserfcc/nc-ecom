import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

// Get WhatsApp metrics and logs for monitoring
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")
    const eventType = searchParams.get("eventType")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    // Build query with filters
    let query = `SELECT * FROM whatsapp_logs WHERE 1=1`
    const params: any[] = []

    if (eventType) {
      params.push(eventType)
      query += ` AND event_type = $${params.length}`
    }

    if (startDate) {
      params.push(new Date(startDate))
      query += ` AND created_at >= $${params.length}`
    }

    if (endDate) {
      params.push(new Date(endDate))
      query += ` AND created_at <= $${params.length}`
    }

    // Get logs
    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${
      params.length + 2
    }`
    params.push(limit, offset)

    const logsResult = await db.query(query, params)

    // Get total count
    let countQuery = `SELECT COUNT(*) as total FROM whatsapp_logs WHERE 1=1`
    const countParams: any[] = []

    if (eventType) {
      countParams.push(eventType)
      countQuery += ` AND event_type = $${countParams.length}`
    }

    if (startDate) {
      countParams.push(new Date(startDate))
      countQuery += ` AND created_at >= $${countParams.length}`
    }

    if (endDate) {
      countParams.push(new Date(endDate))
      countQuery += ` AND created_at <= $${countParams.length}`
    }

    const countResult = await db.query(countQuery, countParams)
    const total = parseInt(countResult.rows[0].total)

    // Get metrics
    const metricsResult = await db.query(`
      SELECT 
        event_type,
        COUNT(*) as count,
        MAX(created_at) as last_occurrence
      FROM whatsapp_logs
      GROUP BY event_type
      ORDER BY count DESC
    `)

    // Get today's activity
    const todayResult = await db.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as total_events,
        SUM(CASE WHEN event_type = 'message_received' THEN 1 ELSE 0 END) as messages_received,
        SUM(CASE WHEN event_type = 'status_notification_sent' THEN 1 ELSE 0 END) as notifications_sent,
        SUM(CASE WHEN event_type = 'order_created' THEN 1 ELSE 0 END) as orders_created,
        SUM(CASE WHEN event_type = 'webhook_error' THEN 1 ELSE 0 END) as errors
      FROM whatsapp_logs
      WHERE DATE(created_at) = CURRENT_DATE
      GROUP BY DATE(created_at)
    `)

    return NextResponse.json({
      logs: logsResult.rows,
      pagination: {
        total,
        limit,
        offset,
        pages: Math.ceil(total / limit),
      },
      metrics: metricsResult.rows,
      todayActivity: todayResult.rows[0] || {
        date: new Date().toISOString().split("T")[0],
        total_events: 0,
        messages_received: 0,
        notifications_sent: 0,
        orders_created: 0,
        errors: 0,
      },
    })
  } catch (error) {
    console.error("❌ Error fetching WhatsApp logs:", error)
    return NextResponse.json(
      { error: "Failed to fetch logs" },
      { status: 500 }
    )
  }
}

// Get WhatsApp statistics
export async function POST(request: NextRequest) {
  try {
    const { action, startDate, endDate } = await request.json()

    if (action === "stats") {
      // Get comprehensive statistics
      const params: any[] = []
      let dateFilter = ""

      if (startDate && endDate) {
        params.push(new Date(startDate), new Date(endDate))
        dateFilter = `WHERE created_at BETWEEN $1 AND $2`
      }

      const statsResult = await db.query(
        `
        SELECT 
          COUNT(*) FILTER (WHERE event_type = 'message_received') as total_messages_received,
          COUNT(*) FILTER (WHERE event_type = 'status_notification_sent') as total_notifications_sent,
          COUNT(*) FILTER (WHERE event_type = 'order_created') as total_orders_created_whatsapp,
          COUNT(*) FILTER (WHERE event_type = 'webhook_error') as total_errors,
          COUNT(DISTINCT SUBSTRING(event_data, '"customerNumber": "([^"]+)"')) as unique_customers,
          AVG(CASE WHEN event_type = 'status_notification_sent' THEN 1 ELSE 0 END) as notification_success_rate,
          MAX(created_at) as last_activity
        FROM whatsapp_logs
        ${dateFilter}
      `,
        params
      )

      return NextResponse.json({
        statistics: statsResult.rows[0],
        dateRange: { startDate, endDate },
      })
    }

    if (action === "export") {
      // Export logs as JSON
      const params: any[] = []
      let dateFilter = "WHERE 1=1"

      if (startDate && endDate) {
        params.push(new Date(startDate), new Date(endDate))
        dateFilter = `WHERE created_at BETWEEN $1 AND $2`
      }

      const logsResult = await db.query(
        `SELECT * FROM whatsapp_logs ${dateFilter} ORDER BY created_at DESC`,
        params
      )

      return NextResponse.json({
        exportedAt: new Date(),
        totalRecords: logsResult.rows.length,
        logs: logsResult.rows,
      })
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    )
  } catch (error) {
    console.error("❌ Error processing WhatsApp stats:", error)
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    )
  }
}
