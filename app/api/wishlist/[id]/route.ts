import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { handleApiError } from "@/lib/api-error-handler"

// DELETE - Remove item from wishlist
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const result = await sql`
      DELETE FROM wishlists
      WHERE id = ${Number.parseInt(id)} AND user_id = ${session.user.id}::uuid
      RETURNING id
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Wishlist item not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}
