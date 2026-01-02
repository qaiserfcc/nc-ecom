import { NextResponse, NextRequest } from "next/server"
import { sql } from "@/lib/db"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const { id, itemId } = await params
    const bundleId = Number.parseInt(id)
    const itemIdNum = Number.parseInt(itemId)

    if (Number.isNaN(bundleId) || Number.isNaN(itemIdNum)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
    }

    // Verify the item belongs to this bundle
    const item = await sql`
      SELECT id FROM bundle_items 
      WHERE id = ${itemIdNum} AND bundle_id = ${bundleId}
    `

    if (item.length === 0) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    // Delete the item
    await sql`DELETE FROM bundle_items WHERE id = ${itemIdNum}`

    return NextResponse.json({ message: "Item deleted successfully" })
  } catch (error) {
    console.error("Error deleting bundle item:", error)
    return NextResponse.json(
      { error: "Failed to delete bundle item" },
      { status: 500 }
    )
  }
}
