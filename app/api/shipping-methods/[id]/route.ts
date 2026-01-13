import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"

// GET /api/shipping-methods/[id] - Get single shipping method
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params
    const id = parseInt(rawId)
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid shipping method ID" },
        { status: 400 }
      )
    }

    const result = await sql`SELECT * FROM shipping_methods WHERE id = ${id}`

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Shipping method not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ shippingMethod: result[0] })
  } catch (error: any) {
    console.error("Error fetching shipping method:", error)
    return NextResponse.json(
      { error: "Failed to fetch shipping method" },
      { status: 500 }
    )
  }
}

// PUT /api/shipping-methods/[id] - Update shipping method (admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 }
      )
    }

    const { id: rawId } = await params
    const id = parseInt(rawId)
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid shipping method ID" },
        { status: 400 }
      )
    }

    const body = await req.json()
    const { 
      name, 
      description, 
      base_cost, 
      min_order_amount,
      max_order_amount,
      is_free_shipping,
      location_type,
      is_same_day,
      is_active,
      sort_order 
    } = body

    const result = await sql`
      UPDATE shipping_methods 
       SET name = ${name}, 
           description = ${description || null}, 
           base_cost = ${base_cost || 0}, 
           min_order_amount = ${min_order_amount || null},
           max_order_amount = ${max_order_amount || null},
           is_free_shipping = ${is_free_shipping || false},
           location_type = ${location_type || 'all'},
           is_same_day = ${is_same_day || false},
           is_active = ${is_active !== undefined ? is_active : true},
           sort_order = ${sort_order || 0},
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ${id}
       RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Shipping method not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ shippingMethod: result[0] })
  } catch (error: any) {
    console.error("Error updating shipping method:", error)
    return NextResponse.json(
      { error: "Failed to update shipping method" },
      { status: 500 }
    )
  }
}

// DELETE /api/shipping-methods/[id] - Delete shipping method (admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 }
      )
    }

    const { id: rawId } = await params
    const id = parseInt(rawId)
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid shipping method ID" },
        { status: 400 }
      )
    }

    const result = await sql`DELETE FROM shipping_methods WHERE id = ${id} RETURNING *`

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Shipping method not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      message: "Shipping method deleted successfully" 
    })
  } catch (error: any) {
    console.error("Error deleting shipping method:", error)
    return NextResponse.json(
      { error: "Failed to delete shipping method" },
      { status: 500 }
    )
  }
}
