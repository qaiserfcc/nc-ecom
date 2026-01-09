import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"

// GET Meta Pixel configuration (admin only)
export async function GET() {
  try {
    const session = await getSession()
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const config = await sql`
      SELECT * FROM meta_pixel_config ORDER BY id DESC LIMIT 1
    `

    if (config.length === 0) {
      return NextResponse.json({
        pixel_id: "",
        access_token: "",
        test_event_code: "",
        is_active: false,
        enable_automatic_events: true,
        enable_advanced_matching: false,
      })
    }

    return NextResponse.json(config[0])
  } catch (error) {
    console.error("Get Meta Pixel config error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST/PUT Meta Pixel configuration (admin only)
export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      pixel_id,
      access_token,
      test_event_code,
      is_active,
      enable_automatic_events,
      enable_advanced_matching,
    } = body

    // Validate required fields
    if (!pixel_id) {
      return NextResponse.json({ error: "Pixel ID is required" }, { status: 400 })
    }

    // Check if config exists
    const existing = await sql`
      SELECT id FROM meta_pixel_config ORDER BY id DESC LIMIT 1
    `

    if (existing.length > 0) {
      // Update existing config
      const updated = await sql`
        UPDATE meta_pixel_config
        SET 
          pixel_id = ${pixel_id},
          access_token = ${access_token || null},
          test_event_code = ${test_event_code || null},
          is_active = ${is_active !== undefined ? is_active : true},
          enable_automatic_events = ${enable_automatic_events !== undefined ? enable_automatic_events : true},
          enable_advanced_matching = ${enable_advanced_matching !== undefined ? enable_advanced_matching : false},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${existing[0].id}
        RETURNING *
      `
      return NextResponse.json(updated[0])
    } else {
      // Insert new config
      const inserted = await sql`
        INSERT INTO meta_pixel_config (
          pixel_id,
          access_token,
          test_event_code,
          is_active,
          enable_automatic_events,
          enable_advanced_matching
        )
        VALUES (
          ${pixel_id},
          ${access_token || null},
          ${test_event_code || null},
          ${is_active !== undefined ? is_active : true},
          ${enable_automatic_events !== undefined ? enable_automatic_events : true},
          ${enable_advanced_matching !== undefined ? enable_advanced_matching : false}
        )
        RETURNING *
      `
      return NextResponse.json(inserted[0])
    }
  } catch (error) {
    console.error("Save Meta Pixel config error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
