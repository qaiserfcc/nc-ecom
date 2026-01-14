import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"

// POST Initialize/Seed default Meta Pixel configuration (admin only)
// This endpoint saves the provided credentials as the default configuration
export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      pixel_id = "932014878052619",
      access_token = "EAAWcOaIQDsEBQfVCS3wU1K4zpLZB4bRwQZBRIUrtlZAFMr7HtUliWWmSt8rqCz95bRz3fQZCbX0TolZBgpBpvu42lM8lhaOv7n8scjazNcENBFqj440vjkbkAHENhZBo43LE4s4fpxk3jZAxGqzvNnesZAXaZCPrB8WQijU1TGwPEFLWtEmUmMyzyU7iNGKJmcAZDZD",
      test_event_code = "TEST15893",
      is_active = true,
      enable_automatic_events = true,
      enable_advanced_matching = true,
    } = body

    // Clear existing configuration
    await sql`DELETE FROM meta_pixel_config`

    // Insert new configuration with defaults
    const result = await sql`
      INSERT INTO meta_pixel_config (
        pixel_id,
        access_token,
        test_event_code,
        is_active,
        enable_automatic_events,
        enable_advanced_matching,
        created_at,
        updated_at
      ) VALUES (
        ${pixel_id},
        ${access_token},
        ${test_event_code},
        ${is_active},
        ${enable_automatic_events},
        ${enable_advanced_matching},
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      )
      RETURNING *
    `

    return NextResponse.json({
      success: true,
      message: "Meta Pixel configuration initialized successfully",
      config: result[0],
    })
  } catch (error) {
    console.error("Initialize Meta Pixel config error:", error)
    return NextResponse.json(
      { error: "Failed to initialize configuration" },
      { status: 500 }
    )
  }
}
