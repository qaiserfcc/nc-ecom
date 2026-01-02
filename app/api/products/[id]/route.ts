import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"

// GET single product
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const result = await sql`
      SELECT p.*, c.name as category_name, c.slug as category_slug,
             COALESCE(
               (SELECT json_agg(json_build_object('id', pi.id, 'image_url', pi.image_url, 'is_primary', pi.is_primary))
                FROM product_images pi WHERE pi.product_id = p.id), '[]'
             ) as images,
             COALESCE(
               (SELECT json_agg(json_build_object('id', pv.id, 'variant_name', pv.variant_name, 'variant_value', pv.variant_value, 'sku', pv.sku, 'price_modifier', pv.price_modifier, 'stock_quantity', pv.stock_quantity))
                FROM product_variants pv WHERE pv.product_id = p.id), '[]'
             ) as variants
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.id = ${Number.parseInt(id)} OR p.slug = ${id}
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Track view for analytics
    const session = await getSession()
    await sql`
      INSERT INTO analytics (user_id, product_id, event_type, event_data)
      VALUES (${session?.user?.id || null}::uuid, ${result[0].id}, 'view', ${JSON.stringify({ source: "product_detail" })})
    `.catch(() => {})

    return NextResponse.json({ product: result[0] })
  } catch (error) {
    console.error("Get product error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT - Update product (admin only)
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const {
      category_id,
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

    const result = await sql`
      UPDATE products SET
        category_id = COALESCE(${category_id}, category_id),
        name = COALESCE(${name}, name),
        slug = COALESCE(${slug}, slug),
        description = COALESCE(${description}, description),
        short_description = COALESCE(${short_description}, short_description),
        original_price = COALESCE(${original_price}, original_price),
        current_price = COALESCE(${current_price}, current_price),
        stock_quantity = COALESCE(${stock_quantity}, stock_quantity),
        is_featured = COALESCE(${is_featured}, is_featured),
        is_new_arrival = COALESCE(${is_new_arrival}, is_new_arrival),
        image_url = COALESCE(${image_url}, image_url),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${Number.parseInt(id)}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Update images if provided
    if (images !== undefined) {
      await sql`DELETE FROM product_images WHERE product_id = ${Number.parseInt(id)}`
      for (const img of images) {
        await sql`
          INSERT INTO product_images (product_id, image_url, is_primary)
          VALUES (${Number.parseInt(id)}, ${img.image_url}, ${img.is_primary || false})
        `
      }
    }

    // Update variants if provided
    if (variants !== undefined) {
      await sql`DELETE FROM product_variants WHERE product_id = ${Number.parseInt(id)}`
      for (const variant of variants) {
        await sql`
          INSERT INTO product_variants (product_id, variant_name, variant_value, sku, price_modifier, stock_quantity)
          VALUES (${Number.parseInt(id)}, ${variant.variant_name}, ${variant.variant_value}, ${variant.sku}, ${variant.price_modifier || 0}, ${variant.stock_quantity || 0})
        `
      }
    }

    return NextResponse.json({ product: result[0] })
  } catch (error) {
    console.error("Update product error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE - Delete product (admin only)
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const result = await sql`
      DELETE FROM products WHERE id = ${Number.parseInt(id)}
      RETURNING id
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete product error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
