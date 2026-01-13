import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"

// POST track analytics event
export async function POST(request: Request) {
  try {
    // Domain gating: only allow tracking on www.namecheap.to
    const hostHeader = request.headers.get("host") || ""
    const host = hostHeader.split(":")[0]
    if (host !== "www.namecheap.to") {
      return NextResponse.json({ success: false, message: "Analytics disabled on this domain" }, { status: 204 })
    }

    const body = await request.json()
    const {
      event_name,
      event_category,
      page_url,
      page_title,
      product_id,
      order_id,
      event_value,
      event_data,
    } = body

    // Get user session (optional - can track anonymous users too)
    let userId = null
    try {
      const session = await getSession()
      if (session?.user?.id) {
        userId = session.user.id
      }
    } catch (e) {
      // Continue without user ID for anonymous tracking
    }

    // Get request headers for additional tracking data
    const headers = request.headers
    const userAgent = headers.get("user-agent") || "unknown"
    const referrer = headers.get("referer") || headers.get("referrer") || ""
    const forwardedFor = headers.get("x-forwarded-for")
    const realIp = headers.get("x-real-ip")
    const ipAddress = forwardedFor?.split(",")[0] || realIp || "unknown"

    // Simple device type detection
    let deviceType = "unknown"
    if (userAgent.includes("Mobile")) {
      deviceType = "mobile"
    } else if (userAgent.includes("Tablet")) {
      deviceType = "tablet"
    } else if (userAgent.includes("Mozilla")) {
      deviceType = "desktop"
    }

    // Simple browser detection
    let browser = "unknown"
    if (userAgent.includes("Chrome")) browser = "Chrome"
    else if (userAgent.includes("Firefox")) browser = "Firefox"
    else if (userAgent.includes("Safari")) browser = "Safari"
    else if (userAgent.includes("Edge")) browser = "Edge"

    // Generate session ID (from cookie or generate new one)
    const sessionId = headers.get("x-session-id") || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Insert analytics event
    const result = await sql`
      INSERT INTO analytics_events (
        user_id,
        session_id,
        event_name,
        event_category,
        page_url,
        page_title,
        referrer,
        user_agent,
        ip_address,
        device_type,
        browser,
        product_id,
        order_id,
        event_value,
        event_data
      )
      VALUES (
        ${userId},
        ${sessionId},
        ${event_name},
        ${event_category || null},
        ${page_url || null},
        ${page_title || null},
        ${referrer},
        ${userAgent},
        ${ipAddress},
        ${deviceType},
        ${browser},
        ${product_id || null},
        ${order_id || null},
        ${event_value || null},
        ${event_data ? JSON.stringify(event_data) : null}
      )
      RETURNING id
    `

    // Also track in the original analytics table for backward compatibility
    if (product_id && ["view", "add_to_cart", "add_to_wishlist", "purchase"].includes(event_name)) {
      await sql`
        INSERT INTO analytics (user_id, product_id, event_type, event_data, created_at)
        VALUES (${userId}, ${product_id}, ${event_name}, ${event_data ? JSON.stringify(event_data) : null}, CURRENT_TIMESTAMP)
      `
    }

    return NextResponse.json({ 
      success: true, 
      event_id: result[0].id,
      session_id: sessionId
    })
  } catch (error) {
    console.error("Track analytics event error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
