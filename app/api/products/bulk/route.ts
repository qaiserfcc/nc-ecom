import { type NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"
import { randomUUID } from "crypto"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"

async function downloadAndStoreImage(imageUrl?: string): Promise<string> {
  if (!imageUrl) return ""
  const trimmed = imageUrl.trim()
  if (!/^https?:\/\//i.test(trimmed)) return trimmed

  const uploadsDir = path.join(process.cwd(), "public", "uploads")
  await fs.mkdir(uploadsDir, { recursive: true })

  const urlObj = new URL(trimmed)
  const ext = path.extname(urlObj.pathname) || ".jpg"
  const safeExt = ext.length > 5 ? ".jpg" : ext
  const fileName = `${randomUUID()}${safeExt}`
  const filePath = path.join(uploadsDir, fileName)

  const response = await fetch(trimmed)
  if (!response.ok) {
    throw new Error(`Failed to download image (${response.status})`)
  }

  const buffer = Buffer.from(await response.arrayBuffer())
  await fs.writeFile(filePath, buffer)
  return `/uploads/${fileName}`
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

        const localImageUrl = await downloadAndStoreImage(product.image_url)
        const result = await sql`
          INSERT INTO products (category_id, brand_id, name, slug, description, short_description, original_price, current_price, stock_quantity, is_featured, is_new_arrival, image_url)
          VALUES (${categoryId}, ${product.brand_id}, ${product.name}, ${product.slug}, ${product.description || ""}, ${product.short_description || ""}, ${product.original_price}, ${product.current_price}, ${product.stock_quantity || 0}, ${product.is_featured || false}, ${product.is_new_arrival || false}, ${localImageUrl})
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
