import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { handleApiError, ApiErrors } from "@/lib/api-error-handler"
import { SocketEvents } from "@/lib/socket-events"

// PUT - Update discount (admin only)
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session || session.user.role !== "admin") {
      throw ApiErrors.unauthorized('Admin access required')
    }

    const { id } = await params
    const body = await request.json()

    // Get current discount for comparison
    const current = await sql`SELECT * FROM discounts WHERE id = ${Number.parseInt(id)}`
    if (current.length === 0) {
      throw ApiErrors.notFound('Discount')
    }

    const result = await sql`
      UPDATE discounts SET
        code = COALESCE(${body.code}, code),
        name = COALESCE(${body.name}, name),
        description = COALESCE(${body.description}, description),
        discount_type = COALESCE(${body.discount_type}, discount_type),
        discount_value = COALESCE(${body.discount_value}, discount_value),
        min_purchase_amount = COALESCE(${body.min_purchase_amount}, min_purchase_amount),
        max_discount_amount = COALESCE(${body.max_discount_amount}, max_discount_amount),
        start_date = COALESCE(${body.start_date}, start_date),
        end_date = COALESCE(${body.end_date}, end_date),
        is_active = COALESCE(${body.is_active}, is_active),
        apply_to_all = COALESCE(${body.apply_to_all}, apply_to_all)
      WHERE id = ${Number.parseInt(id)}
      RETURNING *
    `

    const discount = result[0]

    // Notify about percentage change if applicable
    if (body.discount_value !== undefined && 
        discount.discount_type === 'percentage' &&
        current[0].discount_value !== body.discount_value) {
      await SocketEvents.notifyDiscountPercentageChange(
        discount.code,
        parseFloat(current[0].discount_value),
        parseFloat(discount.discount_value)
      ).catch(console.error)
    }

    return NextResponse.json({ discount })
  } catch (error) {
    return handleApiError(error)
  }
}

// DELETE - Delete discount (admin only)
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session || session.user.role !== "admin") {
      throw ApiErrors.unauthorized('Admin access required')
    }

    const { id } = await params

    const result = await sql`
      DELETE FROM discounts WHERE id = ${Number.parseInt(id)} RETURNING id
    `

    if (result.length === 0) {
      throw ApiErrors.notFound('Discount')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}
