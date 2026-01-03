import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

// GET product images by product IDs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const idsParam = searchParams.get("ids") // Comma-separated product IDs

    if (!idsParam) {
      return NextResponse.json({ error: "Missing ids parameter" }, { status: 400 })
    }

    const ids = idsParam.split(",").map((id) => Number.parseInt(id)).filter((id) => !isNaN(id))

    if (ids.length === 0) {
      return NextResponse.json({ images: {} })
    }

    // Fetch images for the given product IDs
    const images = await sql`
      SELECT product_id, id, image_url, is_primary
      FROM product_images
      WHERE product_id = ANY(${ids})
      ORDER BY product_id, is_primary DESC, created_at ASC
    `

    // Group images by product_id
    const imagesByProduct: Record<number, any[]> = {}
    ids.forEach((id) => {
      imagesByProduct[id] = []
    })

    images.forEach((img: any) => {
      if (imagesByProduct[img.product_id]) {
        imagesByProduct[img.product_id].push({
          id: img.id,
          image_url: img.image_url,
          is_primary: img.is_primary,
        })
      }
    })

    return NextResponse.json({ images: imagesByProduct })
  } catch (error) {
    console.error("Error fetching product images:", error)
    return NextResponse.json({ error: "Failed to fetch images" }, { status: 500 })
  }
}
