import { type NextRequest, NextResponse } from "next/server"
import { randomUUID } from "crypto"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { optimizeImageBuffer } from "@/lib/image-optimizer"
import { uploadImageBuffer } from "@/lib/storage"

export const runtime = "nodejs"

async function downloadAndOptimizeImage(imageUrl?: string): Promise<{ imagePath: string; thumbPath: string }> {
  if (!imageUrl) return { imagePath: "", thumbPath: "" }
  const trimmed = imageUrl.trim()
  if (!trimmed) return { imagePath: "", thumbPath: "" }

  // Only allow http/https sources for bulk ingestion
  if (!/^https?:\/\//i.test(trimmed)) {
    if (trimmed.startsWith("/uploads/")) {
      return { imagePath: trimmed, thumbPath: "" }
    }
    throw new Error("Bulk upload images must be reachable via http/https")
  }

  const response = await fetch(trimmed)
  if (!response.ok) {
    throw new Error(`Failed to download image (${response.status})`)
  }

  const buffer = Buffer.from(await response.arrayBuffer())
  const optimized = await optimizeImageBuffer(buffer, {
    maxWidth: 1200,
    maxHeight: 1200,
    thumbnailSize: 200,
    quality: 85,
    format: "webp",
  })

  const baseName = randomUUID()
  const mainFilename = `${baseName}.${optimized.format}`
  const thumbFilename = `${baseName}-thumb.${optimized.format}`

  const mainResult = await uploadImageBuffer(optimized.fullBuffer, mainFilename, `image/${optimized.format}`)
  const thumbResult = await uploadImageBuffer(optimized.thumbnailBuffer, thumbFilename, `image/${optimized.format}`)

  return { imagePath: mainResult.url, thumbPath: thumbResult.url }
}

// POST - Bulk upload products (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { products } = await request.json()

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: "Products array is required" }, { status: 400 })
    }

    const results = []
    const errors = []

    for (let i = 0; i < products.length; i++) {
      const product = products[i]
      try {
        // Validate required fields
        if (!product.brand_id) {
          throw new Error("brand_id is required for all products")
        }

        // Handle category by name (case-insensitive)
        let categoryId = product.category_id
        if (product.category_name) {
          // Check if category exists (case-insensitive)
          const existingCategory = await sql`
            SELECT id FROM categories 
            WHERE LOWER(name) = LOWER(${product.category_name})
            LIMIT 1
          `
          
          if (existingCategory.length > 0) {
            categoryId = existingCategory[0].id
          } else {
            // Create new category
            const slug = product.category_name
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-+|-+$/g, '')
            
            const newCategory = await sql`
              INSERT INTO categories (name, slug, description)
              VALUES (${product.category_name}, ${slug}, ${product.category_description || ''})
              RETURNING id
            `
            categoryId = newCategory[0].id
          }
        }

        if (!categoryId) {
          throw new Error("Either category_id or category_name is required")
        }

        const { imagePath: localImageUrl, thumbPath: localThumbUrl } = await downloadAndOptimizeImage(
          product.image_url
        )
        const result = await sql`
          INSERT INTO products (category_id, brand_id, name, slug, description, short_description, original_price, current_price, stock_quantity, is_featured, is_new_arrival, image_url, thumbnail_url)
          VALUES (${categoryId}, ${product.brand_id}, ${product.name}, ${product.slug}, ${product.description || ""}, ${product.short_description || ""}, ${product.original_price}, ${product.current_price}, ${product.stock_quantity || 0}, ${product.is_featured || false}, ${product.is_new_arrival || false}, ${localImageUrl}, ${localThumbUrl})
          ON CONFLICT (slug) DO UPDATE SET
            name = EXCLUDED.name,
            category_id = EXCLUDED.category_id,
            brand_id = EXCLUDED.brand_id,
            description = EXCLUDED.description,
            short_description = EXCLUDED.short_description,
            original_price = EXCLUDED.original_price,
            current_price = EXCLUDED.current_price,
            stock_quantity = EXCLUDED.stock_quantity,
            is_featured = EXCLUDED.is_featured,
            is_new_arrival = EXCLUDED.is_new_arrival,
            image_url = EXCLUDED.image_url,
            thumbnail_url = COALESCE(EXCLUDED.thumbnail_url, products.thumbnail_url),
            updated_at = CURRENT_TIMESTAMP
          RETURNING *
        `
        results.push(result[0])
      } catch (error: any) {
        errors.push({ index: i, product: product.name, error: error.message })
      }
    }

    return NextResponse.json({
      success: results.length,
      failed: errors.length,
      results,
      errors,
    })
  } catch (error) {
    console.error("Bulk upload error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PATCH - Bulk edit existing products (admin only)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { ids, is_featured, is_new_arrival, category_id, brand_id } = body

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "ids array is required" }, { status: 400 })
    }

    const normalizedIds = ids
      .map((id) => Number.parseInt(id))
      .filter((id) => !Number.isNaN(id))

    if (normalizedIds.length === 0) {
      return NextResponse.json({ error: "Invalid ids" }, { status: 400 })
    }

    const featureValue = is_featured === undefined ? null : Boolean(is_featured)
    const newArrivalValue = is_new_arrival === undefined ? null : Boolean(is_new_arrival)
    const categoryValue = category_id === undefined || category_id === "" ? null : Number.parseInt(category_id)
    const brandValue = brand_id === undefined || brand_id === "" ? null : Number.parseInt(brand_id)

    if (featureValue === null && newArrivalValue === null && categoryValue === null && brandValue === null) {
      return NextResponse.json({ error: "No updates provided" }, { status: 400 })
    }

    const updated = await sql`
      UPDATE products
      SET
        is_featured = COALESCE(${featureValue}, is_featured),
        is_new_arrival = COALESCE(${newArrivalValue}, is_new_arrival),
        category_id = COALESCE(${categoryValue}, category_id),
        brand_id = COALESCE(${brandValue}, brand_id),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ANY(${normalizedIds})
      RETURNING id
    `

    return NextResponse.json({ updated: updated.map((row: any) => row.id) })
  } catch (error) {
    console.error("Bulk edit error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
