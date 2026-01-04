import { type NextRequest, NextResponse } from "next/server"
import { randomUUID } from "crypto"
import { getSession } from "@/lib/auth"
import { optimizeImageBuffer } from "@/lib/image-optimizer"
import { uploadImageBuffer } from "@/lib/storage"

export const runtime = "nodejs"

// Upload image (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 })
    }

    // Validate file size (max 10MB before optimization)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be less than 10MB" }, { status: 400 })
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Optimize image and generate thumbnail
    const optimized = await optimizeImageBuffer(buffer, {
      maxWidth: 1200,
      maxHeight: 1200,
      thumbnailSize: 200,
      quality: 85,
      format: "webp",
    })

    // Upload optimized files to storage (cloud or local)
    const baseName = randomUUID()
    const fullFilename = `${baseName}.${optimized.format}`
    const thumbFilename = `${baseName}-thumb.${optimized.format}`

    const fullUrlResult = await uploadImageBuffer(optimized.fullBuffer, fullFilename, `image/${optimized.format}`)
    const thumbUrlResult = await uploadImageBuffer(optimized.thumbnailBuffer, thumbFilename, `image/${optimized.format}`)

    const fullUrl = fullUrlResult.url
    const thumbUrl = thumbUrlResult.url

    // Calculate size reduction
    const reduction = Math.round(((file.size - optimized.fullImageSize) / file.size) * 100)

    return NextResponse.json({
      url: fullUrl,
      thumbnailUrl: thumbUrl,
      filename: file.name,
      originalSize: optimized.originalSize,
      optimizedSize: optimized.fullImageSize,
      thumbnailSize: optimized.thumbnailSize,
      sizeReduction: `${reduction}%`,
      format: optimized.format,
    })
  } catch (error: any) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
