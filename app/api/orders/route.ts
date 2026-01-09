import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"

// Generate order number
function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `NC-${timestamp}-${random}`
}

async function getActivePromotion(subtotal: number) {
  const discounts = await sql`
    SELECT * FROM discounts 
    WHERE is_active = true 
      AND apply_to_all = true
      AND start_date <= NOW() 
      AND end_date >= NOW()
      AND (min_purchase_amount IS NULL OR min_purchase_amount <= ${subtotal})
    ORDER BY discount_value DESC
    LIMIT 1
  `

  if (discounts.length === 0) {
    return { amount: 0, percent: 0, promotion: null as any }
  }

  const discount = discounts[0]
  let amount = 0
  let percent = 0

  if (discount.discount_type === "percentage") {
    percent = Number.parseFloat(discount.discount_value)
    amount = subtotal * (percent / 100)
    if (discount.max_discount_amount && amount > Number.parseFloat(discount.max_discount_amount)) {
      amount = Number.parseFloat(discount.max_discount_amount)
    }
  } else {
    amount = Number.parseFloat(discount.discount_value)
  }

  return { amount, percent, promotion: discount }
}

// GET orders (user sees their orders, admin sees all)
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    let orders
    let countResult

    if (session.user.role === "admin") {
      // Admin sees all orders
      if (status) {
        orders = await sql`
          SELECT o.*, u.name as customer_name, u.email as customer_email,
                 (SELECT json_agg(json_build_object(
                   'id', oi.id, 'product_id', oi.product_id, 'quantity', oi.quantity, 
                   'price_at_purchase', oi.price_at_purchase, 'product_name', p.name, 'product_image', p.image_url
                 ))
                 FROM order_items oi
                 JOIN products p ON oi.product_id = p.id
                 WHERE oi.order_id = o.id) as items
          FROM orders o
          JOIN users u ON o.user_id = u.id
          WHERE o.status = ${status}
          ORDER BY o.created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `
        countResult = await sql`
          SELECT COUNT(*)::int as total FROM orders WHERE status = ${status}
        `
      } else {
        orders = await sql`
          SELECT o.*, u.name as customer_name, u.email as customer_email,
                 (SELECT json_agg(json_build_object(
                   'id', oi.id, 'product_id', oi.product_id, 'quantity', oi.quantity, 
                   'price_at_purchase', oi.price_at_purchase, 'product_name', p.name, 'product_image', p.image_url
                 ))
                 FROM order_items oi
                 JOIN products p ON oi.product_id = p.id
                 WHERE oi.order_id = o.id) as items
          FROM orders o
          JOIN users u ON o.user_id = u.id
          ORDER BY o.created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `
        countResult = await sql`
          SELECT COUNT(*)::int as total FROM orders
        `
      }
    } else {
      // User sees only their orders
      orders = await sql`
        SELECT o.*,
               (SELECT json_agg(json_build_object(
                 'id', oi.id, 'product_id', oi.product_id, 'quantity', oi.quantity, 
                 'price_at_purchase', oi.price_at_purchase, 'product_name', p.name, 'product_image', p.image_url
               ))
               FROM order_items oi
               JOIN products p ON oi.product_id = p.id
               WHERE oi.order_id = o.id) as items
        FROM orders o
        WHERE o.user_id = ${session.user.id}::uuid
        ORDER BY o.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `
      countResult = await sql`
        SELECT COUNT(*)::int as total FROM orders WHERE user_id = ${session.user.id}::uuid
      `
    }

    const total = countResult[0]?.total ?? 0

    return NextResponse.json({
      orders,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + orders.length < total,
      },
    })
  } catch (error) {
    console.error("Get orders error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST - Create order (checkout)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { 
      shipping_address, 
      payment_method = "cash_on_delivery",
      shipping_method_id,
      shipping_cost = 0,
      delivery_time,
      delivery_location
    } = await request.json()

    // Get cart items
    const cartItems = await sql`
      SELECT ci.*, p.current_price, p.original_price, pv.price_modifier
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      LEFT JOIN product_variants pv ON ci.variant_id = pv.id
      WHERE ci.user_id = ${session.user.id}::uuid
    `

    if (cartItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 })
    }

    const totals = cartItems.reduce(
      (acc, item) => {
        const priceModifier = Number.parseFloat(item.price_modifier) || 0
        const original = Number.parseFloat(item.original_price) + priceModifier
        const selling = Number.parseFloat(item.current_price) + priceModifier
        const qty = item.quantity
        acc.original += original * qty
        acc.selling += selling * qty
        return acc
      },
      { original: 0, selling: 0 },
    )

    const { amount: promoAmount } = await getActivePromotion(totals.selling)
    const subtotal = totals.selling
    const discountApplied = promoAmount
    const totalAmount = Math.max(0, subtotal - promoAmount + Number(shipping_cost || 0))

    // Create order
    const orderNumber = generateOrderNumber()
    const orderResult = await sql`
      INSERT INTO orders (
        order_number, user_id, total_amount, subtotal, discount_applied, 
        status, payment_method, shipping_address, shipping_method_id, 
        shipping_cost, delivery_time, delivery_location
      )
      VALUES (
        ${orderNumber}, ${session.user.id}::uuid, ${totalAmount}, ${subtotal}, 
        ${discountApplied}, 'pending', ${payment_method}, ${shipping_address},
        ${shipping_method_id || null}, ${shipping_cost || 0}, ${delivery_time || null}, 
        ${delivery_location || null}
      )
      RETURNING *
    `

    const order = orderResult[0]

    // Create order items
    for (const item of cartItems) {
      const price = Number.parseFloat(item.current_price) + (Number.parseFloat(item.price_modifier) || 0)
      await sql`
        INSERT INTO order_items (order_id, product_id, variant_id, quantity, price_at_purchase)
        VALUES (${order.id}, ${item.product_id}, ${item.variant_id}, ${item.quantity}, ${price})
      `

      // Update stock
      await sql`
        UPDATE products SET stock_quantity = stock_quantity - ${item.quantity}
        WHERE id = ${item.product_id}
      `

      // Track purchase analytics
      await sql`
        INSERT INTO analytics (user_id, product_id, event_type, event_data)
        VALUES (${session.user.id}::uuid, ${item.product_id}, 'purchase', ${JSON.stringify({ quantity: item.quantity, price, order_id: order.id })})
      `.catch(() => {})
    }

    // Clear cart
    await sql`DELETE FROM cart_items WHERE user_id = ${session.user.id}::uuid`

    return NextResponse.json({ order }, { status: 201 })
  } catch (error) {
    console.error("Create order error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
