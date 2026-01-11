import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { handleApiError } from "@/lib/api-error-handler"

// GET all categories
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const rawLimit = Number.parseInt(searchParams.get("limit") || "1000")
    const limit = Math.min(rawLimit, 1000)
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    let categories
    let countResult

    if (search) {
      categories = await sql`
        SELECT c.*, 
               pc.name as parent_category_name,
               (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) as product_count,
               (SELECT COUNT(*) FROM categories sc WHERE sc.parent_category_id = c.id) as subcategory_count
        FROM categories c
        LEFT JOIN categories pc ON c.parent_category_id = pc.id
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
               pc.name as parent_category_name,
               (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) as product_count,
               (SELECT COUNT(*) FROM categories sc WHERE sc.parent_category_id = c.id) as subcategory_count
        FROM categories c
        LEFT JOIN categories pc ON c.parent_category_id = pc.id
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
    return handleApiError(error)
  }
}

// POST - Create category (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, slug, description, image_url, parent_category_id } = await request.json()

    // Normalize parent_category_id: treat null, undefined, 0, and empty string as NULL
    const normalizedParentId = parent_category_id && parent_category_id !== 0 ? parent_category_id : null

    const result = await sql`
      INSERT INTO categories (name, slug, description, image_url, parent_category_id)
      VALUES (${name}, ${slug}, ${description}, ${image_url}, ${normalizedParentId})
      RETURNING *
    `

    return NextResponse.json({ category: result[0] }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
