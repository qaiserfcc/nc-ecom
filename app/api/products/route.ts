import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { getSession } from "@/lib/auth"

const sql = neon(process.env.DATABASE_URL!)

// GET all products with optional filters
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

    const products = await sql`
      SELECT p.*, c.name as category_name, c.slug as category_slug,
             b.name as brand_name, b.slug as brand_slug, b.logo_url as brand_logo,
             COALESCE(
               (SELECT json_agg(json_build_object('id', pi.id, 'image_url', pi.image_url, 'is_primary', pi.is_primary))
                FROM product_images pi WHERE pi.product_id = p.id), '[]'::json
             ) as images,
             COALESCE(
               (SELECT json_agg(json_build_object('id', pv.id, 'variant_name', pv.variant_name, 'variant_value', pv.variant_value, 'sku', pv.sku, 'price_modifier', pv.price_modifier, 'stock_quantity', pv.stock_quantity))
                FROM product_variants pv WHERE pv.product_id = p.id), '[]'::json
             ) as variants
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
      JOIN categories c ON p.category_id = c.id
      WHERE p.id IS NOT NULL ${countFilters.length > 0 ? sql.unsafe(`AND ${countFilters.join(" AND ")}`) : sql``}
    `

    const total = countResult[0]?.total ?? 0

    // Track product views for analytics (only if user is logged in)
    const session = await getSession()
    if (session && products.length > 0) {
      try {
        await sql`
          INSERT INTO analytics (user_id, event_type, event_data)
          VALUES (${session.user.id}::uuid, 'view', ${JSON.stringify({ type: "product_list", count: products.length })})
        `
      } catch {
        // Ignore analytics errors
      }
    }

    return NextResponse.json({
      products,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + products.length < total,
      },
    })
  } catch (error) {
    console.error("Get products error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST - Create product (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      category_id,
      brand_id,
      name,
      slug,
      description,
      short_description,
      original_price,
      current_price,
      stock_quantity,
      is_featured,
      is_new_arrival,
      image_url,
      images,
      variants,
    } = body

    // Validate required fields
    if (!brand_id) {
      return NextResponse.json({ error: "brand_id is required" }, { status: 400 })
    }

    // Insert product
    const result = await sql`
      INSERT INTO products (category_id, brand_id, name, slug, description, short_description, original_price, current_price, stock_quantity, is_featured, is_new_arrival, image_url)
      VALUES (${category_id}, ${brand_id}, ${name}, ${slug}, ${description}, ${short_description}, ${original_price}, ${current_price}, ${stock_quantity || 0}, ${is_featured || false}, ${is_new_arrival || false}, ${image_url})
      RETURNING *
    `

    const product = result[0]

    // Insert images if provided
    if (images && images.length > 0) {
      for (const img of images) {
        await sql`
          INSERT INTO product_images (product_id, image_url, is_primary)
          VALUES (${product.id}, ${img.image_url}, ${img.is_primary || false})
        `
      }
    }

    // Insert variants if provided
    if (variants && variants.length > 0) {
      for (const variant of variants) {
        await sql`
          INSERT INTO product_variants (product_id, variant_name, variant_value, sku, price_modifier, stock_quantity)
          VALUES (${product.id}, ${variant.variant_name}, ${variant.variant_value}, ${variant.sku}, ${variant.price_modifier || 0}, ${variant.stock_quantity || 0})
        `
      }
    }

    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    console.error("Create product error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
