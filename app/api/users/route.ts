import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"
import bcrypt from "bcryptjs"

// GET users (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const role = searchParams.get("role")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    let users
    if (search) {
      users = await sql`
        SELECT id, email, name, phone, address, city, postal_code, country, role, created_at,
               (SELECT COUNT(*) FROM orders o WHERE o.user_id = users.id) as order_count,
               (SELECT COALESCE(SUM(total_amount), 0) FROM orders o WHERE o.user_id = users.id) as total_spent
        FROM users
        WHERE (name ILIKE ${"%" + search + "%"} OR email ILIKE ${"%" + search + "%"})
          AND (${role}::text IS NULL OR role = ${role})
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `
    } else {
      users = await sql`
        SELECT id, email, name, phone, address, city, postal_code, country, role, created_at,
               (SELECT COUNT(*) FROM orders o WHERE o.user_id = users.id) as order_count,
               (SELECT COALESCE(SUM(total_amount), 0) FROM orders o WHERE o.user_id = users.id) as total_spent
        FROM users
        WHERE (${role}::text IS NULL OR role = ${role})
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `
    }

    const countResult = await sql`SELECT COUNT(*) as total FROM users`

    return NextResponse.json({
      users,
      total: Number.parseInt(countResult[0].total),
    })
  } catch (error) {
    console.error("Get users error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST - Create new user (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      email,
      password,
      phone,
      address,
      city,
      postal_code,
      country,
      role = "user",
    } = body

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      )
    }

    // Check if email exists
    const existingUser = await sql`SELECT id FROM users WHERE email = ${email}`
    if (existingUser.length > 0) {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const result = await sql`
      INSERT INTO users (name, email, password_hash, phone, address, city, postal_code, country, role, created_at)
      VALUES (${name}, ${email}, ${hashedPassword}, ${phone || null}, ${address || null}, ${city || null}, ${postal_code || null}, ${country || null}, ${role}, NOW())
      RETURNING id, email, name, role, created_at
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error: any) {
    console.error("Create user error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

