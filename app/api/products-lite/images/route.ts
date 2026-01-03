import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

// Helper to validate image URL
function isValidImageUrl(url: string): boolean {
  if (!url) return false
  try {
    // Check if it's a valid URL format
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Helper to get multiple image format options
function getImageFormatOptions(imageUrl: string, acceptWebP: boolean): string[] {
  if (!imageUrl || !isValidImageUrl(imageUrl)) {
    return ['/placeholder.svg?height=300&width=300']
  }

  const formats: string[] = [imageUrl] // Original first
  
  // Add WebP alternative if supported
  if (acceptWebP && !imageUrl.endsWith('.webp')) {
    const baseUrl = imageUrl.substring(0, imageUrl.lastIndexOf('.'))
    formats.push(`${baseUrl}.webp`)
  }
  
  // Add JPEG alternative
  if (!imageUrl.endsWith('.jpg') && !imageUrl.endsWith('.jpeg')) {
    const baseUrl = imageUrl.substring(0, imageUrl.lastIndexOf('.'))
    formats.push(`${baseUrl}.jpg`)
  }
  
  // Always add placeholder as fallback
  formats.push('/placeholder.svg?height=300&width=300')
  
  return formats
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

    // Set query timeout to 30 seconds
    let images: any[] = []
    
    try {
      // Fetch images for the given product IDs with explicit timeout
      images = await Promise.race([
        sql`
          SELECT product_id, id, image_url, is_primary
          FROM product_images
          WHERE product_id = ANY(${ids})
          ORDER BY product_id, is_primary DESC, created_at ASC
          LIMIT 1000
        `,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Database query timeout')), 30000)
        ),
      ]) as any[]
    } catch (dbError) {
      console.error("Database error fetching images:", dbError)
      // Return empty images object to avoid breaking the UI
      return NextResponse.json(
        { images: {}, error: "Database error fetching images" },
        { status: 503 }
      )
    }

    // Group images by product_id with format options
    const imagesByProduct: Record<number, any[]> = {}
    ids.forEach((id) => {
      imagesByProduct[id] = []
    })

    images.forEach((img: any) => {
      if (imagesByProduct[img.product_id]) {
        const validUrl = isValidImageUrl(img.image_url)
        const formats = getImageFormatOptions(img.image_url, acceptWebP)
        
        imagesByProduct[img.product_id].push({
          id: img.id,
          image_url: img.image_url, // Primary URL
          format_options: formats, // Fallback options
          is_primary: img.is_primary,
          is_valid: validUrl,
          fallback: !validUrl, // Flag if using fallback
        })
      }
    })

    const response = NextResponse.json({ images: imagesByProduct })
    
    // Cache images for 1 hour with revalidation
    response.headers.set(
      "Cache-Control",
      "public, max-age=3600, must-revalidate"
    )
    
    // Add CORS headers for image requests
    response.headers.set("Access-Control-Allow-Origin", "*")
    response.headers.set("Access-Control-Allow-Methods", "GET")
    
    return response
  } catch (error) {
    console.error("Error fetching product images:", error)
    
    // Return a valid response instead of error to prevent UI breakage
    return NextResponse.json(
      { images: {}, error: "Failed to fetch images" },
      { status: 200 } // Return 200 to prevent error cascading
    )
  }
}
