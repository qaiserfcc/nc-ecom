import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { handleApiError } from "@/lib/api-error-handler"

// GET single category
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const categoryId = Number.parseInt(id)

    const result = await sql`
      SELECT c.*, 
             pc.name as parent_category_name,
             (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) as product_count,
             (SELECT COUNT(*) FROM categories sc WHERE sc.parent_category_id = c.id) as subcategory_count
      FROM categories c
      LEFT JOIN categories pc ON c.parent_category_id = pc.id
      WHERE c.id = ${categoryId}
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    return NextResponse.json({ category: result[0] })
  } catch (error) {
    return handleApiError(error)
  }
}

// PUT - Update category (admin only)
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const categoryId = Number.parseInt(id)
    const { name, slug, description, image_url, parent_category_id } = await request.json()

    // Normalize parent_category_id: treat null, undefined, 0, and empty string as NULL
    const normalizedParentId = parent_category_id && parent_category_id !== 0 ? parent_category_id : null

    // Prevent circular references
    if (normalizedParentId === categoryId) {
      return NextResponse.json({ error: "A category cannot be its own parent" }, { status: 400 })
    }

    const result = await sql`
      UPDATE categories
      SET name = ${name},
          slug = ${slug},
          description = ${description},
          image_url = ${image_url},
          parent_category_id = ${normalizedParentId}
      WHERE id = ${categoryId}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    return NextResponse.json({ category: result[0] })
  } catch (error) {
    return handleApiError(error)
  }
}

// DELETE - Delete category (admin only)
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const categoryId = Number.parseInt(id)

    // Check if category has products
    const productCheck = await sql`
      SELECT COUNT(*) as count FROM products WHERE category_id = ${categoryId}
    `

    if (productCheck[0].count > 0) {
      return NextResponse.json(
        { error: `Cannot delete category with ${productCheck[0].count} products. Reassign products first.` },
        { status: 400 }
      )
    }

    // Check if category has subcategories
    const subcategoryCheck = await sql`
      SELECT COUNT(*) as count FROM categories WHERE parent_category_id = ${categoryId}
    `

    if (subcategoryCheck[0].count > 0) {
      return NextResponse.json(
        { error: `Cannot delete category with ${subcategoryCheck[0].count} subcategories. Delete subcategories first.` },
        { status: 400 }
      )
    }

    await sql`DELETE FROM categories WHERE id = ${categoryId}`

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}
