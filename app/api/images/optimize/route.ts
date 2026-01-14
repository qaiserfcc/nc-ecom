import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { redisCache } from '@/lib/redis-cache'

// Supported formats
const SUPPORTED_FORMATS = ['webp', 'avif', 'jpeg', 'png'] as const
type ImageFormat = typeof SUPPORTED_FORMATS[number]

// Quality settings for different formats
const FORMAT_QUALITY = {
  webp: 80,
  avif: 70,
  jpeg: 85,
  png: 90,
} as const

// Maximum image dimensions
const MAX_WIDTH = 2048
const MAX_HEIGHT = 2048

interface ImageProcessingOptions {
  width?: number
  height?: number
  format?: ImageFormat
  quality?: number
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside'
  position?: string
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Extract parameters
    const imageUrl = searchParams.get('url')
    const width = searchParams.get('w') ? parseInt(searchParams.get('w')!) : undefined
    const height = searchParams.get('h') ? parseInt(searchParams.get('h')!) : undefined
    const format = searchParams.get('f') as ImageFormat | null
    const quality = searchParams.get('q') ? parseInt(searchParams.get('q')!) : undefined
    const fit = searchParams.get('fit') as ImageProcessingOptions['fit'] || 'cover'
    const position = searchParams.get('position') || 'center'

    // Validate required parameters
    if (!imageUrl) {
      return NextResponse.json({ error: 'Missing image URL' }, { status: 400 })
    }

    // Validate format
    if (format && !SUPPORTED_FORMATS.includes(format)) {
      return NextResponse.json({ error: 'Unsupported format' }, { status: 400 })
    }

    // Validate dimensions
    if (width && (width < 1 || width > MAX_WIDTH)) {
      return NextResponse.json({ error: 'Invalid width' }, { status: 400 })
    }

    if (height && (height < 1 || height > MAX_HEIGHT)) {
      return NextResponse.json({ error: 'Invalid height' }, { status: 400 })
    }

    // Create cache key
    const cacheKey = `image:${imageUrl}:${width || 'auto'}:${height || 'auto'}:${format || 'original'}:${quality || 'default'}:${fit}:${position}`

    // Check cache first
    const cachedImage = await redisCache.get<Buffer>(cacheKey)
    if (cachedImage) {
      console.log(`📋 Image cache hit: ${cacheKey}`)

      const responseFormat = format || getImageFormat(imageUrl)
      const contentType = getContentType(responseFormat)

      return new NextResponse(cachedImage, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
          'X-Cache-Status': 'HIT',
        },
      })
    }

    // Fetch original image
    const imageResponse = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Next.js Image Optimization API',
      },
    })

    if (!imageResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch image' }, { status: 404 })
    }

    const imageBuffer = await imageResponse.arrayBuffer()
    const buffer = Buffer.from(imageBuffer)

    // Get image metadata
    const metadata = await sharp(buffer).metadata()
    const originalFormat = metadata.format

    // Determine output format
    const outputFormat = format || (originalFormat as ImageFormat) || 'jpeg'

    // Prepare Sharp pipeline
    let sharpPipeline = sharp(buffer)

    // Resize if dimensions specified
    if (width || height) {
      const resizeOptions: any = {
        width,
        height,
        fit,
        position,
        withoutEnlargement: true, // Don't upscale images
      }

      sharpPipeline = sharpPipeline.resize(resizeOptions)
    }

    // Convert format and set quality
    const outputQuality = quality || FORMAT_QUALITY[outputFormat] || 80

    switch (outputFormat) {
      case 'webp':
        sharpPipeline = sharpPipeline.webp({ quality: outputQuality })
        break
      case 'avif':
        sharpPipeline = sharpPipeline.avif({ quality: outputQuality })
        break
      case 'jpeg':
        sharpPipeline = sharpPipeline.jpeg({ quality: outputQuality, progressive: true })
        break
      case 'png':
        sharpPipeline = sharpPipeline.png({ quality: outputQuality })
        break
    }

    // Process image
    const processedBuffer = await sharpPipeline.toBuffer()

    // Cache processed image
    await redisCache.set(cacheKey, processedBuffer, 24 * 60 * 60 * 1000) // 24 hours
    console.log(`💾 Cached processed image: ${cacheKey}`)

    // Return processed image
    const contentType = getContentType(outputFormat)

    return new NextResponse(processedBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Cache-Status': 'MISS',
        'X-Original-Format': originalFormat || 'unknown',
        'X-Output-Format': outputFormat,
        'X-Image-Width': width?.toString() || metadata.width?.toString() || 'unknown',
        'X-Image-Height': height?.toString() || metadata.height?.toString() || 'unknown',
      },
    })

  } catch (error) {
    console.error('Image processing error:', error)
    return NextResponse.json(
      { error: 'Image processing failed' },
      { status: 500 }
    )
  }
}

// Helper functions
function getImageFormat(url: string): ImageFormat {
  const extension = url.split('.').pop()?.toLowerCase()
  switch (extension) {
    case 'webp': return 'webp'
    case 'avif': return 'avif'
    case 'png': return 'png'
    case 'jpg':
    case 'jpeg':
    default: return 'jpeg'
  }
}

function getContentType(format: ImageFormat): string {
  switch (format) {
    case 'webp': return 'image/webp'
    case 'avif': return 'image/avif'
    case 'png': return 'image/png'
    case 'jpeg': return 'image/jpeg'
    default: return 'image/jpeg'
  }
}

// Image optimization utilities for server-side use
export const imageOptimization = {
  // Generate optimized image URLs
  generateOptimizedUrl: (
    baseUrl: string,
    options: {
      width?: number
      height?: number
      format?: ImageFormat
      quality?: number
      fit?: ImageProcessingOptions['fit']
      position?: string
    } = {}
  ): string => {
    const params = new URLSearchParams()
    params.set('url', baseUrl)

    if (options.width) params.set('w', options.width.toString())
    if (options.height) params.set('h', options.height.toString())
    if (options.format) params.set('f', options.format)
    if (options.quality) params.set('q', options.quality.toString())
    if (options.fit) params.set('fit', options.fit)
    if (options.position) params.set('position', options.position)

    return `/api/images/optimize?${params.toString()}`
  },

  // Batch optimize multiple images
  batchOptimize: async (
    images: Array<{
      url: string
      options?: ImageProcessingOptions
    }>
  ): Promise<string[]> => {
    const optimizedUrls: string[] = []

    for (const image of images) {
      const optimizedUrl = imageOptimization.generateOptimizedUrl(
        image.url,
        image.options
      )
      optimizedUrls.push(optimizedUrl)
    }

    return optimizedUrls
  },

  // Pre-warm cache for critical images
  prewarmCache: async (
    images: Array<{
      url: string
      options?: ImageProcessingOptions
    }>
  ): Promise<void> => {
    const promises = images.map(async (image) => {
      try {
        const optimizedUrl = imageOptimization.generateOptimizedUrl(
          image.url,
          image.options
        )

        // Make a HEAD request to warm the cache
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${optimizedUrl}`, {
          method: 'HEAD',
        })

        console.log(`🔥 Pre-warmed cache for: ${image.url}`)
      } catch (error) {
        console.error(`Failed to pre-warm cache for: ${image.url}`, error)
      }
    })

    await Promise.allSettled(promises)
  },

  // Clear image cache
  clearCache: async (pattern?: string): Promise<void> => {
    const cachePattern = pattern || 'image:*'
    await redisCache.clearPattern(cachePattern)
    console.log(`🗑️ Cleared image cache with pattern: ${cachePattern}`)
  },
}