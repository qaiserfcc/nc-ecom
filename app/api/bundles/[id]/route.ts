import { NextResponse, NextRequest } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const bundleId = Number.parseInt(id)

    if (Number.isNaN(bundleId)) {
      return NextResponse.json({ error: "Invalid bundle ID" }, { status: 400 })
    }

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
      WHERE pb.id = ${bundleId}
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
    const bundleId = Number.parseInt(id)

    if (Number.isNaN(bundleId)) {
      return NextResponse.json({ error: "Invalid bundle ID" }, { status: 400 })
    }

    const body = await request.json()
    const { name, description, bundle_price, image_url, is_active } = body

    if (!name) {
      return NextResponse.json(
        { error: "Missing required field: name" },
        { status: 400 }
      )
    }

    const result = await sql`
      UPDATE product_bundles
      SET name = ${name},
          description = ${description || ""},
          bundle_price = ${bundle_price},
          image_url = ${image_url || ""},
          is_active = ${is_active !== false}
      WHERE id = ${bundleId}
      RETURNING id, name, bundle_price, is_active
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
    const bundleId = Number.parseInt(id)

    if (Number.isNaN(bundleId)) {
      return NextResponse.json({ error: "Invalid bundle ID" }, { status: 400 })
    }

    // First delete all bundle items
    await sql`DELETE FROM bundle_items WHERE bundle_id = ${bundleId}`

    // Then delete the bundle
    const result = await sql`DELETE FROM product_bundles WHERE id = ${bundleId} RETURNING id`

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
