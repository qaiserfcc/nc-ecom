import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"

// POST - Bulk upload products (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { products } = await request.json()

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: "Products array is required" }, { status: 400 })
    }

    const results = []
    const errors = []

    for (let i = 0; i < products.length; i++) {
      const product = products[i]
      try {
        const result = await sql`
          INSERT INTO products (category_id, name, slug, description, short_description, original_price, current_price, stock_quantity, is_featured, is_new_arrival, image_url)
          VALUES (${product.category_id}, ${product.name}, ${product.slug}, ${product.description || ""}, ${product.short_description || ""}, ${product.original_price}, ${product.current_price}, ${product.stock_quantity || 0}, ${product.is_featured || false}, ${product.is_new_arrival || false}, ${product.image_url || ""})
          ON CONFLICT (slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            short_description = EXCLUDED.short_description,
            original_price = EXCLUDED.original_price,
            current_price = EXCLUDED.current_price,
            stock_quantity = EXCLUDED.stock_quantity,
            is_featured = EXCLUDED.is_featured,
            is_new_arrival = EXCLUDED.is_new_arrival,
            image_url = EXCLUDED.image_url,
            updated_at = CURRENT_TIMESTAMP
          RETURNING *
        `
        results.push(result[0])
      } catch (error: any) {
        errors.push({ index: i, product: product.name, error: error.message })
      }
    }

    return NextResponse.json({
      success: results.length,
      failed: errors.length,
      results,
      errors,
    })
  } catch (error) {
    console.error("Bulk upload error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
