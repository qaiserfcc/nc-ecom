import sharp from "sharp"

export interface OptimizedImageBuffers {
  fullBuffer: Buffer // Optimized full-size image buffer
  thumbnailBuffer: Buffer // Optimized thumbnail buffer
  originalSize: number
  fullImageSize: number
  thumbnailSize: number
  format: string
  mimeType: string
}

export interface ImageOptimizationOptions {
  maxWidth?: number // Max width for full image (default: 1200)
  maxHeight?: number // Max height for full image (default: 1200)
  thumbnailSize?: number // Thumbnail dimensions (square, default: 200)
  quality?: number // Quality for lossy formats (default: 85)
  format?: "webp" | "jpeg" // Output format (default: webp)
}

const DEFAULT_OPTIONS: Required<ImageOptimizationOptions> = {
  maxWidth: 1200,
  maxHeight: 1200,
  thumbnailSize: 200,
  quality: 85,
  format: "webp",
}

/**
 * Optimize an image file and generate thumbnail
 * Resizes, converts format, and optimizes quality
 */
// Optimize an image file and return buffers (useful for server-side storage)
export async function optimizeImage(
  file: File,
  options: ImageOptimizationOptions = {}
): Promise<OptimizedImageBuffers> {
  const arrayBuffer = await file.arrayBuffer()
  return optimizeImageBuffer(Buffer.from(arrayBuffer), options)
}

/**
 * Optimize an image buffer (server-side)
 * For use in API routes with multipart form data
 */
export async function optimizeImageBuffer(
  buffer: Buffer,
  options: ImageOptimizationOptions = {}
): Promise<OptimizedImageBuffers> {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const originalSize = buffer.length

  const fullImageBuffer = await sharp(buffer)
    .resize(opts.maxWidth, opts.maxHeight, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .toFormat(opts.format, { quality: opts.quality })
    .toBuffer()

  const thumbnailBuffer = await sharp(buffer)
    .resize(opts.thumbnailSize, opts.thumbnailSize, {
      fit: "cover",
      position: "center",
    })
    .toFormat(opts.format, { quality: opts.quality })
    .toBuffer()

  const mimeType = `image/${opts.format}`

  return {
    fullBuffer: fullImageBuffer,
    thumbnailBuffer,
    originalSize,
    fullImageSize: fullImageBuffer.length,
    thumbnailSize: thumbnailBuffer.length,
    format: opts.format,
    mimeType,
  }
}

/**
 * Validate image file before processing
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (!file.type.startsWith("image/")) {
    return { valid: false, error: "File must be an image" }
  }

  // Check file size (max 10MB before optimization)
  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    return { valid: false, error: "File size must be less than 10MB" }
  }

  // Check supported formats
  const supportedFormats = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
  if (!supportedFormats.includes(file.type)) {
    return {
      valid: false,
      error: "Only JPEG, PNG, and WebP images are supported",
    }
  }

  return { valid: true }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
}
