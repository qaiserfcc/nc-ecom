import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { verifyAuth } from "@/lib/auth"

// GET /api/quotes/[id] - Get a single quote
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await verifyAuth(request)
    
    if (!authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    
    let result
    if (authResult.isAdmin) {
      result = await query(
        `SELECT q.*, u.name as user_name, u.email as user_email 
         FROM quotes q
         LEFT JOIN users u ON q.user_id = u.id
         WHERE q.id = $1`,
        [id]
      )
    } else {
      result = await query(
        `SELECT * FROM quotes WHERE id = $1 AND user_id = $2`,
        [id, authResult.user.id]
      )
    }

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 })
    }

    return NextResponse.json({ quote: result.rows[0] })
  } catch (error) {
    console.error("Error fetching quote:", error)
    return NextResponse.json(
      { error: "Failed to fetch quote" },
      { status: 500 }
    )
  }
}

// PATCH /api/quotes/[id] - Update a quote (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await verifyAuth(request)
    
    if (!authResult.isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { status, quoted_price, admin_notes } = body

    // Build update query dynamically
    const updates: string[] = []
    const values: any[] = []
    let paramCount = 1

    if (status) {
      updates.push(`status = $${paramCount}`)
      values.push(status)
      paramCount++
    }

    if (quoted_price !== undefined) {
      updates.push(`quoted_price = $${paramCount}`)
      values.push(quoted_price)
      paramCount++
    }

    if (admin_notes !== undefined) {
      updates.push(`admin_notes = $${paramCount}`)
      values.push(admin_notes)
      paramCount++
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`)

    if (updates.length === 1) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      )
    }

    values.push(id)
    const sql = `
      UPDATE quotes 
      SET ${updates.join(", ")} 
      WHERE id = $${paramCount}
      RETURNING *
    `

    const result = await query(sql, values)

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 })
    }

    return NextResponse.json({ 
      quote: result.rows[0],
      message: "Quote updated successfully" 
    })
  } catch (error) {
    console.error("Error updating quote:", error)
    return NextResponse.json(
      { error: "Failed to update quote" },
      { status: 500 }
    )
  }
}

// DELETE /api/quotes/[id] - Delete a quote (admin or owner)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await verifyAuth(request)
    
    if (!authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    
    let result
    if (authResult.isAdmin) {
      result = await query(`DELETE FROM quotes WHERE id = $1 RETURNING *`, [id])
    } else {
      result = await query(
        `DELETE FROM quotes WHERE id = $1 AND user_id = $2 RETURNING *`,
        [id, authResult.user.id]
      )
    }

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 })
    }

    return NextResponse.json({ 
      message: "Quote deleted successfully" 
    })
  } catch (error) {
    console.error("Error deleting quote:", error)
    return NextResponse.json(
      { error: "Failed to delete quote" },
      { status: 500 }
    )
  }
}
