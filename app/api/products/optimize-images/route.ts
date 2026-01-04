import { randomUUID } from "crypto"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { optimizeImageBuffer } from "@/lib/image-optimizer"
import { uploadImageBuffer } from "@/lib/storage"

export const runtime = "nodejs"
export const maxDuration = 300 // 5 minutes for long-running optimization

/**
 * POST /api/products/optimize-images
 * Converts all base64 images in products table to file-based images
 * and updates the database with new file paths
 */
export async function POST(request: Request) {
  try {
    // Check authentication and admin role
    const session = await getSession()
    if (!session?.user || session.user.role !== "admin") {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      })
    }

    // Get all products with base64 images
    const products = await sql`
      SELECT id, image_url, name
      FROM products
      WHERE image_url IS NOT NULL AND image_url LIKE 'data:image%'
      LIMIT 1000
    `

    // Also check product_images table
    const productImages = await sql`
      SELECT id, product_id, image_url
      FROM product_images
      WHERE image_url IS NOT NULL AND image_url LIKE 'data:image%'
      LIMIT 1000
    `

    const results = {
      productsProcessed: 0,
      productImagesProcessed: 0,
      errors: [] as string[],
      updatedProductIds: [] as number[],
      updatedImageIds: [] as number[],
    }

    // Process main product images
    for (const product of products) {
      try {
        if (!product.image_url || !product.image_url.startsWith("data:image")) {
          continue
        }

        // Extract base64 data
        const base64Data = product.image_url.split(",")[1]
        if (!base64Data) {
          results.errors.push(`Product ${product.id} (${product.name}): Invalid base64 format`)
          continue
        }

        const buffer = Buffer.from(base64Data, "base64")

        // Optimize the image
        const { fullBuffer, thumbnailBuffer, sizes, mimeType } = await optimizeImageBuffer(buffer)

        // Generate unique filenames
        const uuid = randomUUID()
        const filename = `product-${product.id}-${uuid}.webp`
        const thumbFilename = `product-${product.id}-${uuid}-thumb.webp`

        // Upload to storage (cloud or local)
        const imageResult = await uploadImageBuffer(fullBuffer, filename, 'image/webp')
        const thumbnailResult = await uploadImageBuffer(thumbnailBuffer, thumbFilename, 'image/webp')

        const imageUrl = imageResult.url
        const thumbnailUrl = thumbnailResult.url

        // Update product with new image and thumbnail URLs
        await sql`
          UPDATE products
          SET image_url = ${imageUrl}, thumbnail_url = ${thumbnailUrl}, updated_at = CURRENT_TIMESTAMP
          WHERE id = ${product.id}
        `

        results.productsProcessed++
        results.updatedProductIds.push(product.id)
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        results.errors.push(`Product ${product.id}: ${errorMsg}`)
      }
    }

    // Process product_images table
    for (const image of productImages) {
      try {
        if (!image.image_url || !image.image_url.startsWith("data:image")) {
          continue
        }

        // Extract base64 data
        const base64Data = image.image_url.split(",")[1]
        if (!base64Data) {
          results.errors.push(`Product image ${image.id}: Invalid base64 format`)
          continue
        }

        const buffer = Buffer.from(base64Data, "base64")

        // Optimize the image
        const { fullBuffer } = await optimizeImageBuffer(buffer)

        // Generate unique filename
        const uuid = randomUUID()
        const filename = `product-img-${image.id}-${uuid}.webp`

        // Upload to storage (cloud or local)
        const imageResult = await uploadImageBuffer(fullBuffer, filename, 'image/webp')

        const imageUrl = imageResult.url

        // Update product_images with new image URL
        await sql`
          UPDATE product_images
          SET image_url = ${imageUrl}
          WHERE id = ${image.id}
        `

        results.productImagesProcessed++
        results.updatedImageIds.push(image.id)
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        results.errors.push(`Product image ${image.id}: ${errorMsg}`)
      }
    }

    return Response.json({
      success: true,
      message: `Optimization complete: ${results.productsProcessed} product images and ${results.productImagesProcessed} gallery images converted`,
      results,
    })
  } catch (error) {
    console.error("Optimization error:", error)
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Failed to optimize images",
      },
      { status: 500 }
    )
  }
}
