import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"
import crypto from "crypto"

// Helper function to hash user data for Meta
function hashValue(value: string | null | undefined): string | null {
  if (!value) return null
  return crypto.createHash("sha256").update(value.toLowerCase().trim()).digest("hex")
}

// POST track conversion event for Meta Conversion API
export async function POST(request: Request) {
  try {
    // Domain gating: only allow conversion tracking on www.namecheap.to
    const hostHeader = request.headers.get("host") || ""
    const host = hostHeader.split(":")[0]
    if (host !== "www.namecheap.to") {
      return NextResponse.json({ success: false, message: "Conversion tracking disabled on this domain" }, { status: 204 })
    }

    const body = await request.json()
    const {
      event_name, // ViewContent, AddToCart, AddToWishlist, InitiateCheckout, Purchase, etc.
      event_source_url,
      product_id,
      order_id,
      value,
      currency = "PKR",
      content_ids,
      content_type,
      user_data,
      custom_data,
    } = body

    // Validate event name
    const validEvents = [
      "ViewContent",
      "AddToCart",
      "AddToWishlist",
      "InitiateCheckout",
      "AddPaymentInfo",
      "Purchase",
      "Lead",
      "CompleteRegistration",
      "Search",
      "PageView",
    ]
    
    if (!validEvents.includes(event_name)) {
      return NextResponse.json({ error: "Invalid event name" }, { status: 400 })
    }

    // Get user session
    let userId = null
    let email = null
    let phone = null
    let firstName = null
    let lastName = null

    try {
      const session = await getSession()
      if (session?.user) {
        userId = session.user.id
        email = session.user.email
        const nameParts = session.user.name?.split(" ") || []
        firstName = nameParts[0] || ""
        lastName = nameParts.slice(1).join(" ") || ""
        
        // Get phone from user profile if available
        const userProfile = await sql`
          SELECT phone FROM users WHERE id = ${userId}
        `
        if (userProfile[0]?.phone) {
          phone = userProfile[0].phone
        }
      }
    } catch (e) {
      // Continue without user data
    }

    // Generate unique event ID
    const eventId = `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const eventTime = Math.floor(Date.now() / 1000) // Unix timestamp in seconds

    // Get request headers for IP and user agent
    const headers = request.headers
    const userAgent = headers.get("user-agent") || ""
    const forwardedFor = headers.get("x-forwarded-for")
    const realIp = headers.get("x-real-ip")
    const ipAddress = forwardedFor?.split(",")[0] || realIp || ""

    // Prepare hashed user data for Meta (GDPR compliant)
    const metaUserData = {
      em: email ? hashValue(email) : null, // hashed email
      ph: phone ? hashValue(phone) : null, // hashed phone
      fn: firstName ? hashValue(firstName) : null, // hashed first name
      ln: lastName ? hashValue(lastName) : null, // hashed last name
      client_ip_address: ipAddress,
      client_user_agent: userAgent,
      ...(user_data || {}),
    }

    // Prepare custom data
    const metaCustomData = {
      value: value || 0,
      currency: currency,
      content_ids: content_ids || (product_id ? [product_id.toString()] : []),
      content_type: content_type || "product",
      ...(custom_data || {}),
    }

    // Store conversion event in database
    const result = await sql`
      INSERT INTO conversion_events (
        event_name,
        event_id,
        event_source_url,
        user_id,
        order_id,
        product_id,
        event_time,
        user_data,
        custom_data,
        value,
        currency,
        content_ids,
        content_type,
        sent_to_meta
      )
      VALUES (
        ${event_name},
        ${eventId},
        ${event_source_url || null},
        ${userId},
        ${order_id || null},
        ${product_id || null},
        ${eventTime},
        ${JSON.stringify(metaUserData)},
        ${JSON.stringify(metaCustomData)},
        ${value || null},
        ${currency},
        ${content_ids ? content_ids : null},
        ${content_type || "product"},
        false
      )
      RETURNING id
    `

    // Get Meta Pixel configuration
    const config = await sql`
      SELECT * FROM meta_pixel_config WHERE is_active = true ORDER BY id DESC LIMIT 1
    `

    // Send to Meta Conversion API if configured
    let metaResponse = null
    if (config.length > 0 && config[0].pixel_id && config[0].access_token) {
      try {
        const metaApiUrl = `https://graph.facebook.com/v18.0/${config[0].pixel_id}/events`
        
        const metaPayload = {
          data: [
            {
              event_name: event_name,
              event_time: eventTime,
              event_id: eventId,
              event_source_url: event_source_url || "",
              action_source: "website",
              user_data: metaUserData,
              custom_data: metaCustomData,
            },
          ],
          access_token: config[0].access_token,
          ...(config[0].test_event_code ? { test_event_code: config[0].test_event_code } : {}),
        }

        const response = await fetch(metaApiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(metaPayload),
        })

        metaResponse = await response.json()

        // Update conversion event with Meta response
        await sql`
          UPDATE conversion_events
          SET sent_to_meta = true, meta_response = ${JSON.stringify(metaResponse)}
          WHERE id = ${result[0].id}
        `
      } catch (metaError) {
        console.error("Meta Conversion API error:", metaError)
        // Don't fail the request if Meta API fails
        metaResponse = { error: "Failed to send to Meta" }
      }
    }

    return NextResponse.json({
      success: true,
      event_id: eventId,
      conversion_id: result[0].id,
      sent_to_meta: !!metaResponse,
      meta_response: metaResponse,
    })
  } catch (error) {
    console.error("Track conversion event error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// GET conversion events stats (admin only)
export async function GET() {
  try {
    const session = await getSession()
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const stats = await sql`
      SELECT 
        event_name,
        COUNT(*) as total_events,
        SUM(CASE WHEN sent_to_meta THEN 1 ELSE 0 END) as sent_to_meta,
        SUM(value) as total_value
      FROM conversion_events
      WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY event_name
      ORDER BY total_events DESC
    `

    const recentEvents = await sql`
      SELECT *
      FROM conversion_events
      ORDER BY created_at DESC
      LIMIT 20
    `

    return NextResponse.json({
      stats,
      recentEvents,
    })
  } catch (error) {
    console.error("Get conversion events error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
