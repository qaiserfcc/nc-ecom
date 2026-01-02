import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"

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
