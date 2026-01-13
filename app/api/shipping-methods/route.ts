import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"

// GET /api/shipping-methods - Get all shipping methods
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const activeOnly = searchParams.get('activeOnly') === 'true'
    
    let result
    if (activeOnly) {
      result = await sql`SELECT * FROM shipping_methods WHERE is_active = true ORDER BY sort_order ASC, id ASC`
    } else {
      result = await sql`SELECT * FROM shipping_methods ORDER BY sort_order ASC, id ASC`
    }
    
    return NextResponse.json({ 
      shippingMethods: result 
    })
  } catch (error: any) {
    console.error("Error fetching shipping methods:", error)
    return NextResponse.json(
      { error: "Failed to fetch shipping methods" },
      { status: 500 }
    )
  }
}

// POST /api/shipping-methods - Create new shipping method (admin only)
export async function POST(req: NextRequest) {
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

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      )
    }

    const result = await sql`
      INSERT INTO shipping_methods 
        (name, description, base_cost, min_order_amount, max_order_amount, 
         is_free_shipping, location_type, is_same_day, is_active, sort_order)
       VALUES (${name}, ${description || null}, ${base_cost || 0}, ${min_order_amount || null}, 
               ${max_order_amount || null}, ${is_free_shipping || false}, ${location_type || 'all'},
               ${is_same_day || false}, ${is_active !== undefined ? is_active : true}, ${sort_order || 0})
       RETURNING *
    `

    return NextResponse.json({ 
      shippingMethod: result[0] 
    }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating shipping method:", error)
    return NextResponse.json(
      { error: "Failed to create shipping method" },
      { status: 500 }
    )
  }
}
