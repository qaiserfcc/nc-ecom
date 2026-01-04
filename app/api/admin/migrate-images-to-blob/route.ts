import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { uploadImageBuffer } from "@/lib/storage"
import fs from "fs/promises"
import path from "path"

export const runtime = "nodejs"
export const maxDuration = 300 // 5 minutes

/**
 * Admin endpoint to migrate existing /uploads/ images to Vercel Blob
 * Safe to run multiple times - only processes images still in /uploads/ format
 * 
 * POST /api/admin/migrate-images-to-blob?type=products
 * POST /api/admin/migrate-images-to-blob?type=product_images
 * POST /api/admin/migrate-images-to-blob?type=all
 */
export async function POST(request: NextRequest) {
  try {
    // Check admin authorization
    const session = await getSession()
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "all" // products, product_images, or all

    let migratedCount = 0
    let skippedCount = 0
    let errors: string[] = []

    // Migrate products table
    if (type === "all" || type === "products") {
      const result = await migrateProductImages()
      migratedCount += result.migrated
      skippedCount += result.skipped
      errors = [...errors, ...result.errors]
    }

    // Migrate product_images table
    if (type === "all" || type === "product_images") {
      const result = await migrateProductImageRecords()
      migratedCount += result.migrated
      skippedCount += result.skipped
      errors = [...errors, ...result.errors]
    }

    return NextResponse.json({
      success: true,
      message: `Migration completed`,
      stats: {
        migratedCount,
        skippedCount,
        errorCount: errors.length,
      },
      errors: errors.length > 0 ? errors.slice(0, 10) : undefined, // Return first 10 errors
    })
  } catch (error) {
    console.error("Migration error:", error)
    return NextResponse.json(
      { error: "Migration failed", details: String(error) },
      { status: 500 }
    )
  }
}

async function migrateProductImages() {
  let migrated = 0
  let skipped = 0
  const errors: string[] = []

  try {
    // Get all products with /uploads/ URLs
    const products = await sql`
      SELECT id, image_url, thumbnail_url
      FROM products
      WHERE image_url LIKE '/uploads/%' OR thumbnail_url LIKE '/uploads/%'
    `

    for (const product of products) {
      try {
        let updatedImageUrl = product.image_url
        let updatedThumbnailUrl = product.thumbnail_url

        // Migrate main image
        if (product.image_url?.startsWith("/uploads/")) {
          const newUrl = await migrateImageFile(product.image_url)
          if (newUrl) {
            updatedImageUrl = newUrl
          }
        }

        // Migrate thumbnail
        if (product.thumbnail_url?.startsWith("/uploads/")) {
          const newUrl = await migrateImageFile(product.thumbnail_url)
          if (newUrl) {
            updatedThumbnailUrl = newUrl
          }
        }

        // Update product if any image was migrated
        if (updatedImageUrl !== product.image_url || updatedThumbnailUrl !== product.thumbnail_url) {
          await sql`
            UPDATE products
            SET image_url = ${updatedImageUrl}, 
                thumbnail_url = ${updatedThumbnailUrl},
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ${product.id}
          `
          migrated++
        } else {
          skipped++
        }
      } catch (error) {
        errors.push(`Product ${product.id}: ${String(error)}`)
      }
    }
  } catch (error) {
    errors.push(`Failed to fetch products: ${String(error)}`)
  }

  return { migrated, skipped, errors }
}

async function migrateProductImageRecords() {
  let migrated = 0
  let skipped = 0
  const errors: string[] = []

  try {
    // Get all product_images with /uploads/ URLs
    const images = await sql`
      SELECT id, product_id, image_url
      FROM product_images
      WHERE image_url LIKE '/uploads/%'
    `

    for (const image of images) {
      try {
        const newUrl = await migrateImageFile(image.image_url)
        if (newUrl) {
          await sql`
            UPDATE product_images
            SET image_url = ${newUrl}
            WHERE id = ${image.id}
          `
          migrated++
        } else {
          skipped++
        }
      } catch (error) {
        errors.push(`Image ${image.id}: ${String(error)}`)
      }
    }
  } catch (error) {
    errors.push(`Failed to fetch product_images: ${String(error)}`)
  }

  return { migrated, skipped, errors }
}

async function migrateImageFile(uploadPath: string): Promise<string | null> {
  // Extract filename from path
  const filename = path.basename(uploadPath)
  if (!filename) {
    throw new Error(`Invalid path: ${uploadPath}`)
  }

  // Only process /uploads/ paths
  if (!uploadPath.startsWith("/uploads/")) {
    return null
  }

  // Try to read from local filesystem (for dev/local storage)
  const localPath = path.join(process.cwd(), "public", uploadPath)

  try {
    const buffer = await fs.readFile(localPath)

    // Determine MIME type from extension
    const ext = path.extname(filename).toLowerCase()
    const mimeType = {
      ".webp": "image/webp",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
    }[ext] || "image/webp"

    // Upload to Vercel Blob
    const result = await uploadImageBuffer(buffer, filename, mimeType)
    console.log(`Migrated ${filename} to Vercel Blob: ${result.url}`)
    return result.url
  } catch (error) {
    // If local file not found, image might already be in cloud storage
    // Return null to skip this image
    if (String(error).includes("ENOENT")) {
      return null
    }
    throw error
  }
}

// GET endpoint for checking migration status
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Count images that still need migration
    const [productCount] = await Promise.all([
      sql`SELECT COUNT(*) as count FROM products WHERE image_url LIKE '/uploads/%'`,
      sql`SELECT COUNT(*) as count FROM product_images WHERE image_url LIKE '/uploads/%'`,
    ])

    const productsToMigrate = (productCount as any[])[0]?.count || 0
    const productImagesToMigrate = (productCount as any[])[0]?.count || 0

    return NextResponse.json({
      status: "ready",
      itemsToMigrate: {
        products: productsToMigrate,
        productImages: productImagesToMigrate,
        total: productsToMigrate + productImagesToMigrate,
      },
      instructions: [
        "This endpoint migrates existing /uploads/ images to Vercel Blob",
        "GET to check how many items need migration",
        "POST to start the migration process",
        "The migration is safe to run multiple times",
      ],
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to check status", details: String(error) },
      { status: 500 }
    )
  }
}
