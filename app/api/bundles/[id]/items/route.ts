import { NextResponse, NextRequest } from "next/server"
import { sql } from "@/lib/db"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const bundleId = Number.parseInt(id)

    if (Number.isNaN(bundleId)) {
      return NextResponse.json({ error: "Invalid bundle ID" }, { status: 400 })
    }

    const body = await request.json()
    const { product_id, quantity } = body

    if (!product_id || !quantity) {
      return NextResponse.json(
        { error: "Missing required fields: product_id, quantity" },
        { status: 400 }
      )
    }

    // Check if product exists
    const product = await sql`SELECT id, name, current_price FROM products WHERE id = ${product_id}`
    if (product.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Check if bundle exists
    const bundle = await sql`SELECT id FROM product_bundles WHERE id = ${bundleId}`
    if (bundle.length === 0) {
      return NextResponse.json({ error: "Bundle not found" }, { status: 404 })
    }

    // Check if item already exists in bundle
    const existing = await sql`
      SELECT id FROM bundle_items 
      WHERE bundle_id = ${bundleId} AND product_id = ${product_id}
    `

    if (existing.length > 0) {
      // Update quantity if item already exists
      await sql`
        UPDATE bundle_items
        SET quantity = ${quantity}
        WHERE bundle_id = ${bundleId} AND product_id = ${product_id}
      `
    } else {
      // Insert new item
      await sql`
        INSERT INTO bundle_items (bundle_id, product_id, quantity)
        VALUES (${bundleId}, ${product_id}, ${quantity})
      `
    }

    // Return the added/updated item
    const result = await sql`
      SELECT bi.id, bi.product_id, bi.quantity, p.name as product_name, p.current_price as product_price
      FROM bundle_items bi
      JOIN products p ON bi.product_id = p.id
      WHERE bi.bundle_id = ${bundleId} AND bi.product_id = ${product_id}
    `

    return NextResponse.json({ item: result[0] })
  } catch (error) {
    console.error("Error adding bundle item:", error)
    return NextResponse.json(
      { error: "Failed to add bundle item" },
      { status: 500 }
    )
  }
}
