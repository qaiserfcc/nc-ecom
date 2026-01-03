import { NextResponse, NextRequest } from "next/server"
import { sql } from "@/lib/db"

// GET all brand partnerships
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    let brands
    let countResult

    if (search) {
      brands = await sql`
        SELECT * FROM brand_partnerships 
        WHERE name ILIKE ${"%" + search + "%"}
        ORDER BY is_featured DESC, name ASC
        LIMIT ${limit} OFFSET ${offset}
      `
      countResult = await sql`
        SELECT COUNT(*)::int as total FROM brand_partnerships
        WHERE name ILIKE ${"%" + search + "%"}
      `
    } else {
      brands = await sql`
        SELECT * FROM brand_partnerships 
        ORDER BY is_featured DESC, name ASC
        LIMIT ${limit} OFFSET ${offset}
      `
      countResult = await sql`
        SELECT COUNT(*)::int as total FROM brand_partnerships
      `
    }

    const total = countResult[0]?.total ?? 0

    return NextResponse.json({
      brands,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + brands.length < total,
      },
    })
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
