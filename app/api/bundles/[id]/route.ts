import { NextResponse, NextRequest } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const bundle = await sql`
      SELECT pb.*,
             COALESCE(
               (SELECT json_agg(json_build_object(
                 'id', bi.id, 'product_id', bi.product_id, 'quantity', bi.quantity,
                 'product_name', p.name, 'product_image', p.image_url, 'product_price', p.current_price
               ))
               FROM bundle_items bi
               JOIN products p ON bi.product_id = p.id
               WHERE bi.bundle_id = pb.id), '[]'
             ) as items,
             COALESCE(
               (SELECT SUM(p.current_price * bi.quantity)
                FROM bundle_items bi
                JOIN products p ON bi.product_id = p.id
                WHERE bi.bundle_id = pb.id), 0
             ) as original_price
      FROM product_bundles pb
      WHERE pb.id = ${id} OR pb.slug = ${id}
    `

    if (bundle.length === 0) {
      return NextResponse.json({ error: "Bundle not found" }, { status: 404 })
    }

    return NextResponse.json({ bundle: bundle[0] })
  } catch (error) {
    console.error("Get bundle error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, slug, description, bundle_price, image_url, is_active } = body

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Missing required fields: name, slug" },
        { status: 400 }
      )
    }

    const result = await sql`
      UPDATE product_bundles
      SET name = ${name},
          slug = ${slug},
          description = ${description || ""},
          bundle_price = ${bundle_price},
          image_url = ${image_url || ""},
          is_active = ${is_active !== false},
          updated_at = NOW()
      WHERE id = ${parseInt(id)}
      RETURNING id, name, slug, bundle_price, is_active
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Bundle not found" }, { status: 404 })
    }

    return NextResponse.json({ bundle: result[0] })
  } catch (error) {
    console.error("Error updating bundle:", error)
    return NextResponse.json(
      { error: "Failed to update bundle" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // First delete all bundle items
    await sql`DELETE FROM bundle_items WHERE bundle_id = ${parseInt(id)}`

    // Then delete the bundle
    const result = await sql`DELETE FROM product_bundles WHERE id = ${parseInt(id)} RETURNING id`

    if (result.length === 0) {
      return NextResponse.json({ error: "Bundle not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Bundle deleted successfully" })
  } catch (error) {
    console.error("Error deleting bundle:", error)
    return NextResponse.json(
      { error: "Failed to delete bundle" },
      { status: 500 }
    )
  }
}
