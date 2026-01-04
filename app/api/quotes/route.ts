import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { verifyAuth } from "@/lib/auth"

// GET /api/quotes - Get all quotes (admin gets all, users get their own)
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request)
    
    if (!authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    
    let sql = ""
    let params: any[] = []
    
    if (authResult.isAdmin) {
      // Admin gets all quotes
      sql = `
        SELECT q.*, u.name as user_name, u.email as user_email 
        FROM quotes q
        LEFT JOIN users u ON q.user_id = u.id
      `
      if (status) {
        sql += " WHERE q.status = $1"
        params = [status]
      }
      sql += " ORDER BY q.created_at DESC"
    } else {
      // Regular users get only their quotes
      sql = `
        SELECT * FROM quotes 
        WHERE user_id = $1
      `
      params = [authResult.user.id]
      
      if (status) {
        sql += " AND status = $2"
        params.push(status)
      }
      sql += " ORDER BY created_at DESC"
    }

    const result = await query(sql, params)

    return NextResponse.json({ 
      quotes: result.rows,
      count: result.rows.length 
    })
  } catch (error) {
    console.error("Error fetching quotes:", error)
    return NextResponse.json(
      { error: "Failed to fetch quotes" },
      { status: 500 }
    )
  }
}

// POST /api/quotes - Create a new quote request
export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request)
    
    if (!authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { 
      customer_name, 
      customer_email, 
      customer_phone, 
      product_details, 
      quantity, 
      additional_notes 
    } = body

    // Validation
    if (!customer_name || !customer_email || !product_details) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const result = await query(
      `INSERT INTO quotes 
        (user_id, customer_name, customer_email, customer_phone, product_details, quantity, additional_notes, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
       RETURNING *`,
      [
        authResult.user.id,
        customer_name,
        customer_email,
        customer_phone || null,
        product_details,
        quantity || 1,
        additional_notes || null,
      ]
    )

    return NextResponse.json({ 
      quote: result.rows[0],
      message: "Quote request submitted successfully" 
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating quote:", error)
    return NextResponse.json(
      { error: "Failed to create quote request" },
      { status: 500 }
    )
  }
}
