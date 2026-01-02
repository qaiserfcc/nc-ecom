import { NextResponse, NextRequest } from "next/server"
import { sql } from "@/lib/db"

// GET all brand partnerships
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const all = searchParams.get("all") === "true"

    let brands
    if (all) {
      brands = await sql`
        SELECT * FROM brand_partnerships 
        ORDER BY is_featured DESC, name ASC
      `
    } else {
      brands = await sql`
        SELECT * FROM brand_partnerships 
        ORDER BY is_featured DESC, name ASC
      `
    }

    return NextResponse.json({ brands })
  } catch (error) {
    console.error("Get brands error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST create brand
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      name,
      description,
      logo_url,
      website_url,
      is_featured,
    } = body

    if (!name) {
      return NextResponse.json(
        { error: "Missing required field: name" },
        { status: 400 }
      )
    }

    const result = await sql`
      INSERT INTO brand_partnerships (
        name, description, logo_url, website_url, is_featured
      )
      VALUES (
        ${name}, ${description || ""}, ${logo_url || ""},
        ${website_url || ""}, ${is_featured === true}
      )
      RETURNING *
    `

    return NextResponse.json({ brand: result[0] }, { status: 201 })
  } catch (error) {
    console.error("Error creating brand:", error)
    return NextResponse.json(
      { error: "Failed to create brand" },
      { status: 500 }
    )
  }
}
