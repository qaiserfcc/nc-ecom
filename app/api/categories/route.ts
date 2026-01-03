import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"

// GET all categories
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    let categories
    let countResult

    if (search) {
      categories = await sql`
        SELECT c.*, 
               (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) as product_count
        FROM categories c
        WHERE c.name ILIKE ${"%" + search + "%"}
        ORDER BY c.name ASC
        LIMIT ${limit} OFFSET ${offset}
      `
      countResult = await sql`
        SELECT COUNT(*)::int as total FROM categories c
        WHERE c.name ILIKE ${"%" + search + "%"}
      `
    } else {
      categories = await sql`
        SELECT c.*, 
               (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) as product_count
        FROM categories c
        ORDER BY c.name ASC
        LIMIT ${limit} OFFSET ${offset}
      `
      countResult = await sql`
        SELECT COUNT(*)::int as total FROM categories c
      `
    }

    const total = countResult[0]?.total ?? 0

    return NextResponse.json({
      categories,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + categories.length < total,
      },
    })
  } catch (error) {
    console.error("Get categories error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST - Create category (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, slug, description, image_url } = await request.json()

    const result = await sql`
      INSERT INTO categories (name, slug, description, image_url)
      VALUES (${name}, ${slug}, ${description}, ${image_url})
      RETURNING *
    `

    return NextResponse.json({ category: result[0] }, { status: 201 })
  } catch (error) {
    console.error("Create category error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
