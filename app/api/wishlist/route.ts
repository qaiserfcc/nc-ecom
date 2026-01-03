import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"

// GET wishlist items
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    const items = await sql`
      SELECT w.*, p.name, p.slug, p.image_url, p.current_price, p.original_price, p.stock_quantity,
             c.name as category_name
      FROM wishlists w
      JOIN products p ON w.product_id = p.id
      JOIN categories c ON p.category_id = c.id
      WHERE w.user_id = ${session.user.id}::uuid
      ORDER BY w.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `

    const countResult = await sql`
      SELECT COUNT(*)::int as total FROM wishlists WHERE user_id = ${session.user.id}::uuid
    `

    const total = countResult[0]?.total ?? 0

    return NextResponse.json({
      items,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + items.length < total,
      },
    })
  } catch (error) {
    console.error("Get wishlist error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST - Add to wishlist
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { product_id } = await request.json()

    // Check if product exists
    const product = await sql`SELECT * FROM products WHERE id = ${product_id}`
    if (product.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    await sql`
      INSERT INTO wishlists (user_id, product_id)
      VALUES (${session.user.id}::uuid, ${product_id})
      ON CONFLICT (user_id, product_id) DO NOTHING
    `

    // Track for analytics (table may not exist)
    try {
      await sql`
        INSERT INTO analytics (user_id, product_id, event_type, event_data)
        VALUES (${session.user.id}::uuid, ${product_id}, 'add_to_wishlist', '{}')
      `
    } catch (analyticsError) {
      // Ignore analytics errors
      console.log('Analytics tracking skipped:', analyticsError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Add to wishlist error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE - Remove from wishlist
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get("product_id")

    if (!productId) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 })
    }

    await sql`
      DELETE FROM wishlists 
      WHERE user_id = ${session.user.id}::uuid AND product_id = ${Number.parseInt(productId)}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Remove from wishlist error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
