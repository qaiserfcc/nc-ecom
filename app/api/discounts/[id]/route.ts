import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"

// PUT - Update discount (admin only)
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

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

    if (result.length === 0) {
      return NextResponse.json({ error: "Discount not found" }, { status: 404 })
    }

    return NextResponse.json({ discount: result[0] })
  } catch (error) {
    console.error("Update discount error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE - Delete discount (admin only)
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const result = await sql`
      DELETE FROM discounts WHERE id = ${Number.parseInt(id)} RETURNING id
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Discount not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete discount error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
