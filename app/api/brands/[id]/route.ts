import { NextResponse, NextRequest } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const brandId = Number.parseInt(id)

    if (Number.isNaN(brandId)) {
      return NextResponse.json({ error: "Invalid brand ID" }, { status: 400 })
    }

    const brand = await sql`
      SELECT * FROM brand_partnerships
      WHERE id = ${brandId}
    `

    if (brand.length === 0) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 })
    }

    return NextResponse.json({ brand: brand[0] })
  } catch (error) {
    console.error("Get brand error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const {
      name,
      slug,
      description,
      logo_url,
      website_url,
      contact_email,
      is_featured,
      is_active,
      established_year,
    } = body

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Missing required fields: name, slug" },
        { status: 400 }
      )
    }

    const result = await sql`
      UPDATE brand_partnerships
      SET name = ${name},
          slug = ${slug},
          description = ${description || ""},
          logo_url = ${logo_url || ""},
          website_url = ${website_url || ""},
          contact_email = ${contact_email || ""},
          is_featured = ${is_featured === true},
          is_active = ${is_active !== false},
          established_year = ${established_year || null}
      WHERE id = ${parseInt(id)}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 })
    }

    return NextResponse.json({ brand: result[0] })
  } catch (error) {
    console.error("Error updating brand:", error)
    return NextResponse.json(
      { error: "Failed to update brand" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const result = await sql`DELETE FROM brand_partnerships WHERE id = ${parseInt(id)} RETURNING id`

    if (result.length === 0) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Brand deleted successfully" })
  } catch (error) {
    console.error("Error deleting brand:", error)
    return NextResponse.json(
      { error: "Failed to delete brand" },
      { status: 500 }
    )
  }
}
