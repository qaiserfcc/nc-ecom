import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { handleApiError, ApiErrors } from "@/lib/api-error-handler"
import { SocketEvents } from "@/lib/socket-events"

// GET discounts (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.user.role !== "admin") {
      throw ApiErrors.unauthorized('Admin access required')
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    let discounts
    let countResult

    if (search) {
      discounts = await sql`
        SELECT * FROM discounts
        WHERE code ILIKE ${"%" + search + "%"} OR name ILIKE ${"%" + search + "%"}
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `
      countResult = await sql`
        SELECT COUNT(*)::int as total FROM discounts
        WHERE code ILIKE ${"%" + search + "%"} OR name ILIKE ${"%" + search + "%"}
      `
    } else {
      discounts = await sql`
        SELECT * FROM discounts
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `
      countResult = await sql`
        SELECT COUNT(*)::int as total FROM discounts
      `
    }

    const total = countResult[0]?.total ?? 0

    return NextResponse.json({
      discounts,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + discounts.length < total,
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}

// POST - Create discount (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.user.role !== "admin") {
      throw ApiErrors.unauthorized('Admin access required')
    }

    const body = await request.json()
    const {
      code,
      name,
      description,
      discount_type,
      discount_value,
      min_purchase_amount,
      max_discount_amount,
      start_date,
      end_date,
      is_active,
      apply_to_all,
    } = body

    const result = await sql`
      INSERT INTO discounts (code, name, description, discount_type, discount_value, min_purchase_amount, max_discount_amount, start_date, end_date, is_active, apply_to_all)
      VALUES (${code}, ${name}, ${description}, ${discount_type}, ${discount_value}, ${min_purchase_amount || 0}, ${max_discount_amount}, ${start_date}, ${end_date}, ${is_active !== false}, ${apply_to_all !== false})
      RETURNING *
    `

    const discount = result[0]

    // Notify about new promotion if active and applies to all
    if (discount.is_active && discount.apply_to_all) {
      const percentage = discount.discount_type === 'percentage' 
        ? parseFloat(discount.discount_value)
        : 0
      await SocketEvents.notifyNewPromotion(
        discount.code,
        percentage,
        discount.description || ''
      ).catch(console.error)
    }

    return NextResponse.json({ discount }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
