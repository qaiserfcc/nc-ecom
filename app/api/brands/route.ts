import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

// GET all brand partnerships
export async function GET() {
  try {
    const brands = await sql`
      SELECT * FROM brand_partnerships 
      ORDER BY is_featured DESC, name ASC
    `

    return NextResponse.json({ brands })
  } catch (error) {
    console.error("Get brands error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
