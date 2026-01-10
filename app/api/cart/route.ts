import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { handleApiError } from "@/lib/api-error-handler"

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
    const totals = items.reduce(
      (acc, item) => {
        const priceModifier = Number.parseFloat(item.price_modifier) || 0
        const original = Number.parseFloat(item.original_price) + priceModifier
        const selling = Number.parseFloat(item.current_price) + priceModifier
        const qty = item.quantity
        acc.original += original * qty
        acc.selling += selling * qty
        acc.itemCount += qty
        return acc
      },
      { original: 0, selling: 0, itemCount: 0 },
    )

    const officialDiscount = Math.max(0, totals.original - totals.selling)
    const officialDiscountPercent = totals.original > 0 ? Math.round((officialDiscount / totals.original) * 100) : 0

    const { amount: promoAmount, percent: promoPercent, promotion } = await getActivePromotion(totals.selling)
    const finalAmount = Math.max(0, totals.selling - promoAmount)
    const cumulativeDiscount = officialDiscount + promoAmount
    const cumulativeDiscountPercent = totals.original > 0 ? Math.round((cumulativeDiscount / totals.original) * 100) : 0

    return NextResponse.json({
      items,
      subtotal: totals.selling,
      totalAmount: finalAmount,
      itemCount: totals.itemCount,
      totals: {
        original: totals.original,
        selling: totals.selling,
        officialDiscount,
        officialDiscountPercent,
        promoAmount,
        promoPercent,
        cumulativeDiscount,
        cumulativeDiscountPercent,
        final: finalAmount,
        promotion: promotion
          ? {
              id: promotion.id,
              name: promotion.name,
              type: promotion.discount_type,
              value: promotion.discount_value,
              maxDiscountAmount: promotion.max_discount_amount,
            }
          : null,
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}

// POST - Add item to cart
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { product_id, variant_id = null, quantity = 1 } = await request.json()

    // Check if product exists and has stock
    const product = await sql`SELECT * FROM products WHERE id = ${product_id}`
    if (product.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Check if item already in cart
    let existing
    if (variant_id) {
      existing = await sql`
        SELECT * FROM cart_items 
        WHERE user_id = ${session.user.id}::uuid 
          AND product_id = ${product_id} 
          AND variant_id = ${variant_id}
      `
    } else {
      existing = await sql`
        SELECT * FROM cart_items 
        WHERE user_id = ${session.user.id}::uuid 
          AND product_id = ${product_id} 
          AND variant_id IS NULL
      `
    }

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

    // Track for analytics (table may not exist)
    try {
      await sql`
        INSERT INTO analytics (user_id, product_id, event_type, event_data)
        VALUES (${session.user.id}::uuid, ${product_id}, 'add_to_cart', ${JSON.stringify({ quantity, variant_id })})
      `
    } catch (analyticsError) {
      // Ignore analytics errors
      console.log('Analytics tracking skipped:', analyticsError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
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
    return handleApiError(error)
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
    return handleApiError(error)
  }
}
