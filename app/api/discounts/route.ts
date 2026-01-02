import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"

// GET discounts (admin only)
export async function GET() {
  try {
    const session = await getSession()
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const discounts = await sql`
      SELECT * FROM discounts ORDER BY created_at DESC
    `

    return NextResponse.json({ discounts })
  } catch (error) {
    console.error("Get discounts error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST - Create discount (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
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

    return NextResponse.json({ discount: result[0] }, { status: 201 })
  } catch (error) {
    console.error("Create discount error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
