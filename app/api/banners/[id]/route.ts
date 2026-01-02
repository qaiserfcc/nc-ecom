import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"

// GET single banner
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const banner = await sql`
      SELECT id, title, description, image_url, link_url, is_active, sort_order, created_at
      FROM homepage_banners
      WHERE id = ${Number(params.id)}
    `

    if (banner.length === 0) {
      return NextResponse.json({ error: "Banner not found" }, { status: 404 })
    }

    return NextResponse.json({ banner: banner[0] })
  } catch (error: any) {
    console.error("Get banner error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

// PUT - Update banner (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, image_url, link_url, is_active, sort_order } = body

    if (!title || !image_url) {
      return NextResponse.json({ error: "Title and image are required" }, { status: 400 })
    }

    const result = await sql`
      UPDATE homepage_banners
      SET title = ${title}, description = ${description || null}, image_url = ${image_url},
          link_url = ${link_url || null}, is_active = ${is_active !== undefined ? is_active : true},
          sort_order = ${sort_order || 0}
      WHERE id = ${Number(params.id)}
      RETURNING id, title, description, image_url, link_url, is_active, sort_order, created_at
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Banner not found" }, { status: 404 })
    }

    return NextResponse.json({ banner: result[0] })
  } catch (error: any) {
    console.error("Update banner error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE - Delete banner (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = await sql`DELETE FROM homepage_banners WHERE id = ${Number(params.id)}`

    if (result.length === 0) {
      return NextResponse.json({ error: "Banner not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Banner deleted successfully" })
  } catch (error: any) {
    console.error("Delete banner error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
