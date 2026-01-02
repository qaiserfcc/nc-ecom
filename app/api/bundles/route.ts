import { NextResponse, NextRequest } from "next/server"
import { sql } from "@/lib/db"

// GET all bundles
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const all = searchParams.get("all") === "true"

    let bundles
    if (all) {
      bundles = await sql`
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
               (SELECT SUM(p.current_price * bi.quantity)
                FROM bundle_items bi
                JOIN products p ON bi.product_id = p.id
                WHERE bi.bundle_id = pb.id) as original_price,
               (SELECT COUNT(*) FROM bundle_items WHERE bundle_id = pb.id) as item_count
        FROM product_bundles pb
        ORDER BY pb.created_at DESC
      `
    } else {
      bundles = await sql`
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
               (SELECT SUM(p.current_price * bi.quantity)
                FROM bundle_items bi
                JOIN products p ON bi.product_id = p.id
                WHERE bi.bundle_id = pb.id) as original_price,
               (SELECT COUNT(*) FROM bundle_items WHERE bundle_id = pb.id) as item_count
        FROM product_bundles pb
        WHERE pb.is_active = true
        ORDER BY pb.created_at DESC
      `
    }

    return NextResponse.json({ bundles })
  } catch (error) {
    console.error("Get bundles error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST create bundle
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, slug, description, bundle_price, image_url, is_active } = body

    if (!name || !slug || bundle_price === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: name, slug, bundle_price" },
        { status: 400 }
      )
    }

    const result = await sql`
      INSERT INTO product_bundles (name, slug, description, bundle_price, image_url, is_active)
      VALUES (${name}, ${slug}, ${description || ""}, ${bundle_price}, ${image_url || ""}, ${is_active !== false})
      RETURNING id, name, slug, bundle_price, is_active
    `

    return NextResponse.json({ bundle: result[0] }, { status: 201 })
  } catch (error) {
    console.error("Error creating bundle:", error)
    return NextResponse.json(
      { error: "Failed to create bundle" },
      { status: 500 }
    )
  }
}
