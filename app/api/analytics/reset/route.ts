import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"

// POST: reset analytics data (admin only)
export async function POST() {
  try {
    const session = await getSession()
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Delete analytics data prior to today
    await sql`
      DELETE FROM analytics_events WHERE created_at < CURRENT_DATE
    `

    await sql`
      DELETE FROM analytics WHERE created_at < CURRENT_DATE
    `

    await sql`
      DELETE FROM conversion_events WHERE created_at < CURRENT_DATE
    `

    return NextResponse.json({ success: true, message: "Analytics reset to start from today" })
  } catch (error) {
    console.error("Reset analytics error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
