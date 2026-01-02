import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"

// GET current user profile
export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = await sql`
      SELECT id, email, name, phone, address, city, postal_code, country, role, created_at
      FROM users WHERE id = ${session.user.id}::uuid
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user: result[0] })
  } catch (error) {
    console.error("Get profile error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT - Update profile
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, phone, address, city, postal_code, country } = body

    const result = await sql`
      UPDATE users SET
        name = COALESCE(${name}, name),
        phone = COALESCE(${phone}, phone),
        address = COALESCE(${address}, address),
        city = COALESCE(${city}, city),
        postal_code = COALESCE(${postal_code}, postal_code),
        country = COALESCE(${country}, country),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${session.user.id}::uuid
      RETURNING id, email, name, phone, address, city, postal_code, country, role, created_at
    `

    return NextResponse.json({ user: result[0] })
  } catch (error) {
    console.error("Update profile error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
