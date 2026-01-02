import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

// GET all bundles
export async function GET() {
  try {
    const bundles = await sql`
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
              WHERE bi.bundle_id = pb.id) as original_price
      FROM product_bundles pb
      WHERE pb.is_active = true
      ORDER BY pb.created_at DESC
    `

    return NextResponse.json({ bundles })
  } catch (error) {
    console.error("Get bundles error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
