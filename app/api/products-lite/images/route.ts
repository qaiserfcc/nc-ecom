import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

// Helper to convert image URL to WebP if supported by client
function getImageUrl(imageUrl: string, acceptWebP: boolean): string {
  if (!imageUrl) return imageUrl
  
  // If client supports WebP, suggest WebP version
  // In production, this would convert to WebP via image service
  if (acceptWebP && !imageUrl.includes('placeholder')) {
    // Return URL that can be handled by image optimization service
    // Format: original.jpg -> original.webp
    const urlWithoutExt = imageUrl.substring(0, imageUrl.lastIndexOf('.'))
    const webpUrl = `${urlWithoutExt}.webp`
    return webpUrl
  }
  
  return imageUrl
}

// GET product images by product IDs with format negotiation
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const idsParam = searchParams.get("ids") // Comma-separated product IDs
    const format = searchParams.get("format") || "auto" // auto, webp, jpeg

    if (!idsParam) {
      return NextResponse.json({ error: "Missing ids parameter" }, { status: 400 })
    }

    const ids = idsParam.split(",").map((id) => Number.parseInt(id)).filter((id) => !isNaN(id))

    if (ids.length === 0) {
      return NextResponse.json({ images: {} })
    }

    // Check client's Accept header for WebP support
    const acceptHeader = request.headers.get("accept") || ""
    const acceptWebP = acceptHeader.includes("image/webp") || format === "webp"

    // Fetch images for the given product IDs
    const images = await sql`
      SELECT product_id, id, image_url, is_primary
      FROM product_images
      WHERE product_id = ANY(${ids})
      ORDER BY product_id, is_primary DESC, created_at ASC
    `

    // Group images by product_id with format negotiation
    const imagesByProduct: Record<number, any[]> = {}
    ids.forEach((id) => {
      imagesByProduct[id] = []
    })

    images.forEach((img: any) => {
      if (imagesByProduct[img.product_id]) {
        const imageUrl = getImageUrl(img.image_url, acceptWebP)
        imagesByProduct[img.product_id].push({
          id: img.id,
          image_url: imageUrl,
          original_url: img.image_url, // Keep original for fallback
          is_primary: img.is_primary,
          format: acceptWebP ? "webp" : "jpeg",
        })
      }
    })

    // Add cache headers for images with revalidation
    const response = NextResponse.json({ images: imagesByProduct })
    
    // Cache images for 1 hour, must revalidate to prevent stale images
    response.headers.set(
      "Cache-Control",
      "public, max-age=3600, must-revalidate"
    )
    
    return response
  } catch (error) {
    console.error("Error fetching product images:", error)
    return NextResponse.json({ error: "Failed to fetch images" }, { status: 500 })
  }
}
