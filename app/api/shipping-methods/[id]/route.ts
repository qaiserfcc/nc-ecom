import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { getSession } from "@/lib/auth"

// GET /api/shipping-methods/[id] - Get single shipping method
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await query(
      "SELECT * FROM shipping_methods WHERE id = $1",
      [params.id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Shipping method not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ shippingMethod: result.rows[0] })
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
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 }
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

    const result = await query(
      `UPDATE shipping_methods 
       SET name = $1, 
           description = $2, 
           base_cost = $3, 
           min_order_amount = $4,
           max_order_amount = $5,
           is_free_shipping = $6,
           location_type = $7,
           is_same_day = $8,
           is_active = $9,
           sort_order = $10,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $11
       RETURNING *`,
      [
        name,
        description || null,
        base_cost || 0,
        min_order_amount || null,
        max_order_amount || null,
        is_free_shipping || false,
        location_type || 'all',
        is_same_day || false,
        is_active !== undefined ? is_active : true,
        sort_order || 0,
        params.id
      ]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Shipping method not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ shippingMethod: result.rows[0] })
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
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 }
      )
    }

    const result = await query(
      "DELETE FROM shipping_methods WHERE id = $1 RETURNING *",
      [params.id]
    )

    if (result.rows.length === 0) {
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
