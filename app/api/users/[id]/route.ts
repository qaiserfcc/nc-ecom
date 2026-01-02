import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"

// GET single user (admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await sql`
      SELECT id, email, name, phone, address, city, postal_code, country, role, created_at
      FROM users
      WHERE id = ${params.id}
    `

    if (user.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user: user[0] })
  } catch (error) {
    console.error("Get user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT - Update user (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, email, phone, address, city, postal_code, country, role } = body

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 })
    }

    // Check if email is already used by another user
    const emailCheck = await sql`
      SELECT id FROM users WHERE email = ${email} AND id != ${params.id}
    `
    if (emailCheck.length > 0) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 })
    }

    const result = await sql`
      UPDATE users
      SET name = ${name}, email = ${email}, phone = ${phone || null}, 
          address = ${address || null}, city = ${city || null}, 
          postal_code = ${postal_code || null}, country = ${country || null},
          role = ${role || "user"}
      WHERE id = ${params.id}
      RETURNING id, email, name, phone, address, city, postal_code, country, role, created_at
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user: result[0] })
  } catch (error: any) {
    console.error("Update user error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE - Delete user (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Don't allow deleting the last admin
    const adminCount = await sql`SELECT COUNT(*) as count FROM users WHERE role = 'admin'`
    const userToDelete = await sql`SELECT role FROM users WHERE id = ${params.id}`

    if (userToDelete.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (userToDelete[0].role === "admin" && adminCount[0].count <= 1) {
      return NextResponse.json(
        { error: "Cannot delete the last admin user" },
        { status: 400 }
      )
    }

    // Delete related orders
    await sql`DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE user_id = ${params.id})`
    await sql`DELETE FROM orders WHERE user_id = ${params.id}`

    // Delete user
    await sql`DELETE FROM users WHERE id = ${params.id}`

    return NextResponse.json({ message: "User deleted successfully" })
  } catch (error: any) {
    console.error("Delete user error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
