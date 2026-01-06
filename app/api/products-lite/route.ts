import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

// GET products WITHOUT images for fast initial load
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const featured = searchParams.get("featured")
    const newArrival = searchParams.get("new")
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")
    const sort = searchParams.get("sort") || "created_at"
    const order = searchParams.get("order") || "desc"
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    const filters: string[] = []
    const countFilters: string[] = []

    if (category) {
      filters.push(`c.slug = '${category.replace(/'/g, "''")}'`)
      countFilters.push(`c.slug = '${category.replace(/'/g, "''")}'`)
    }

    if (search) {
      const escapedSearch = search.replace(/'/g, "''")
      filters.push(`(p.name ILIKE '%${escapedSearch}%' OR p.description ILIKE '%${escapedSearch}%')`)
      countFilters.push(`(p.name ILIKE '%${escapedSearch}%' OR p.description ILIKE '%${escapedSearch}%')`)
    }

    if (featured === "true") {
      filters.push(`p.is_featured = true`)
      countFilters.push(`p.is_featured = true`)
    }

    if (newArrival === "true") {
      filters.push(`p.is_new_arrival = true`)
      countFilters.push(`p.is_new_arrival = true`)
    }

    if (minPrice) {
      filters.push(`p.current_price >= ${Number.parseFloat(minPrice)}`)
      countFilters.push(`p.current_price >= ${Number.parseFloat(minPrice)}`)
    }

    if (maxPrice) {
      filters.push(`p.current_price <= ${Number.parseFloat(maxPrice)}`)
      countFilters.push(`p.current_price <= ${Number.parseFloat(maxPrice)}`)
    }

    // Sanitize sort field
    const validSortFields = ["created_at", "current_price", "name", "stock_quantity"]
    const sortField = validSortFields.includes(sort) ? sort : "created_at"
    const sortOrder = order === "asc" ? "ASC" : "DESC"

    // Lightweight query - include image_url but NO variants
    const products = await sql`
      SELECT p.id, p.slug, p.name, p.description, p.current_price, 
             p.original_price, p.is_new_arrival, p.is_featured, p.stock_quantity,
             p.image_url, p.thumbnail_url,
             c.name as category_name, c.slug as category_slug,
             b.id as brand_id, b.name as brand_name, b.slug as brand_slug
      FROM products p
      JOIN categories c ON p.category_id = c.id
      JOIN brand_partnerships b ON p.brand_id = b.id
      WHERE p.id IS NOT NULL ${filters.length > 0 ? sql.unsafe(`AND ${filters.join(" AND ")}`) : sql``}
      ORDER BY p.${sql.unsafe(sortField)} ${sql.unsafe(sortOrder)}
      LIMIT ${limit} OFFSET ${offset}
    `

    const countResult = await sql`
      SELECT COUNT(*)::int as total
      FROM products p
      JOIN categories c ON p.category_id = c.id
      JOIN brand_partnerships b ON p.brand_id = b.id
      WHERE p.id IS NOT NULL ${countFilters.length > 0 ? sql.unsafe(`AND ${countFilters.join(" AND ")}`) : sql``}
    `

    const total = countResult[0]?.total ?? 0
    const hasMore = offset + limit < total

    return NextResponse.json({
      products,
      pagination: {
        total,
        limit,
        offset,
        hasMore,
      },
    })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}
