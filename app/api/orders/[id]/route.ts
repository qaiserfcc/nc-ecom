import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"

// GET single order
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    let order
    if (session.user.role === "admin") {
      order = await sql`
        SELECT o.*, u.name as customer_name, u.email as customer_email, u.phone as customer_phone,
               (SELECT json_agg(json_build_object(
                 'id', oi.id, 'product_id', oi.product_id, 'quantity', oi.quantity, 
                 'price_at_purchase', oi.price_at_purchase, 'product_name', p.name, 'product_image', p.image_url
               ))
               FROM order_items oi
               JOIN products p ON oi.product_id = p.id
               WHERE oi.order_id = o.id) as items
        FROM orders o
        JOIN users u ON o.user_id = u.id
        WHERE o.id = ${Number.parseInt(id)} OR o.order_number = ${id}
      `
    } else {
      order = await sql`
        SELECT o.*,
               (SELECT json_agg(json_build_object(
                 'id', oi.id, 'product_id', oi.product_id, 'quantity', oi.quantity, 
                 'price_at_purchase', oi.price_at_purchase, 'product_name', p.name, 'product_image', p.image_url
               ))
               FROM order_items oi
               JOIN products p ON oi.product_id = p.id
               WHERE oi.order_id = o.id) as items
        FROM orders o
        WHERE (o.id = ${Number.parseInt(id)} OR o.order_number = ${id})
          AND o.user_id = ${session.user.id}::uuid
      `
    }

    if (order.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({ order: order[0] })
  } catch (error) {
    console.error("Get order error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT - Update order status (admin only)
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const { status } = await request.json()

    const validStatuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const result = await sql`
      UPDATE orders SET status = ${status}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${Number.parseInt(id)}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({ order: result[0] })
  } catch (error) {
    console.error("Update order error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
