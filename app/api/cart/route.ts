import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"

// GET cart items
export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const items = await sql`
      SELECT ci.*, p.name, p.slug, p.image_url, p.current_price, p.original_price, p.stock_quantity,
             pv.variant_name, pv.variant_value, pv.price_modifier
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      LEFT JOIN product_variants pv ON ci.variant_id = pv.id
      WHERE ci.user_id = ${session.user.id}::uuid
      ORDER BY ci.added_at DESC
    `

    // Calculate totals
    const subtotal = items.reduce((acc, item) => {
      const price = Number.parseFloat(item.current_price) + (Number.parseFloat(item.price_modifier) || 0)
      return acc + price * item.quantity
    }, 0)

    return NextResponse.json({
      items,
      subtotal,
      itemCount: items.reduce((acc, item) => acc + item.quantity, 0),
    })
  } catch (error) {
    console.error("Get cart error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST - Add item to cart
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { product_id, variant_id, quantity = 1 } = await request.json()

    // Check if product exists and has stock
    const product = await sql`SELECT * FROM products WHERE id = ${product_id}`
    if (product.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Check if item already in cart
    const existing = await sql`
      SELECT * FROM cart_items 
      WHERE user_id = ${session.user.id}::uuid 
        AND product_id = ${product_id} 
        AND (variant_id = ${variant_id} OR (variant_id IS NULL AND ${variant_id} IS NULL))
    `

    if (existing.length > 0) {
      // Update quantity
      await sql`
        UPDATE cart_items SET quantity = quantity + ${quantity}
        WHERE id = ${existing[0].id}
      `
    } else {
      // Insert new item
      await sql`
        INSERT INTO cart_items (user_id, product_id, variant_id, quantity)
        VALUES (${session.user.id}::uuid, ${product_id}, ${variant_id}, ${quantity})
      `
    }

    // Track for analytics
    await sql`
      INSERT INTO analytics (user_id, product_id, event_type, event_data)
      VALUES (${session.user.id}::uuid, ${product_id}, 'add_to_cart', ${JSON.stringify({ quantity, variant_id })})
    `.catch(() => {})

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Add to cart error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT - Update cart item quantity
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { item_id, quantity } = await request.json()

    if (quantity <= 0) {
      // Delete item if quantity is 0 or less
      await sql`
        DELETE FROM cart_items WHERE id = ${item_id} AND user_id = ${session.user.id}::uuid
      `
    } else {
      await sql`
        UPDATE cart_items SET quantity = ${quantity}
        WHERE id = ${item_id} AND user_id = ${session.user.id}::uuid
      `
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Update cart error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE - Remove item from cart
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get("id")

    if (itemId) {
      await sql`
        DELETE FROM cart_items WHERE id = ${Number.parseInt(itemId)} AND user_id = ${session.user.id}::uuid
      `
    } else {
      // Clear entire cart
      await sql`DELETE FROM cart_items WHERE user_id = ${session.user.id}::uuid`
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete cart error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
