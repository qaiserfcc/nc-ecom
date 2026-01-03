import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

// GET active global discount
export async function GET() {
  try {
    const now = new Date().toISOString()
    
    // Get the active global discount (apply_to_all = true)
    const discounts = await sql`
      SELECT * FROM discounts
      WHERE is_active = true
        AND apply_to_all = true
        AND start_date <= ${now}
        AND end_date >= ${now}
      ORDER BY created_at DESC
      LIMIT 1
    `

    if (discounts.length === 0) {
      return NextResponse.json({ discount: null })
    }

    return NextResponse.json({ discount: discounts[0] })
  } catch (error) {
    console.error("Get active discount error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
