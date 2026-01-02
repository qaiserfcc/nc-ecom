import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"

// GET all banners (public and admin)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const activeOnly = searchParams.get("active") === "true"

    let query = sql`
      SELECT id, title, description, image_url, link_url, is_active, sort_order, created_at
      FROM homepage_banners
    `

    if (activeOnly) {
      query = sql`
        SELECT id, title, description, image_url, link_url, is_active, sort_order, created_at
        FROM homepage_banners
        WHERE is_active = true
        ORDER BY sort_order ASC
      `
    } else {
      query = sql`
        SELECT id, title, description, image_url, link_url, is_active, sort_order, created_at
        FROM homepage_banners
        ORDER BY sort_order ASC
      `
    }

    const banners = await query

    return NextResponse.json({ banners })
  } catch (error: any) {
    console.error("Get banners error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

// POST - Create banner (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, image_url, link_url, sort_order } = body

    if (!title || !image_url) {
      return NextResponse.json({ error: "Title and image are required" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO homepage_banners (title, description, image_url, link_url, sort_order, is_active)
      VALUES (${title}, ${description || null}, ${image_url}, ${link_url || null}, ${sort_order || 0}, true)
      RETURNING id, title, description, image_url, link_url, is_active, sort_order, created_at
    `

    return NextResponse.json({ banner: result[0] }, { status: 201 })
  } catch (error: any) {
    console.error("Create banner error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
