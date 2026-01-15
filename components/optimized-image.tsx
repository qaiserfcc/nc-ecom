'use client'

import Image from 'next/image'
import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { cn } from '@/lib/utils'

interface OptimizedImageProps {
  src: string
  alt: string
  className?: string
  fill?: boolean
  priority?: boolean
  loading?: 'lazy' | 'eager'
  width?: number
  height?: number
  quality?: number
  sizes?: string
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  onLoad?: () => void
  onError?: () => void
  // Enhanced props
  responsive?: boolean
  breakpoints?: number[]
  formats?: ('webp' | 'avif' | 'jpeg' | 'png')[]
  cdnBaseUrl?: string
  lazyOffset?: number
  aspectRatio?: number
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'
}

interface ImageFormat {
  format: string
  src: string
  width?: number
  height?: number
}

export function OptimizedImage({
  src,
  alt,
  className,
  fill = false,
  priority = false,
  loading: initialLoading = 'lazy',
  width = 300,
  height = 300,
  quality = 80,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  placeholder = 'empty',
  blurDataURL,
  onLoad,
  onError: onErrorProp,
  // Enhanced props
  responsive = true,
  breakpoints = [320, 640, 768, 1024, 1280, 1536],
  formats = ['webp', 'avif', 'jpeg'],
  cdnBaseUrl,
  lazyOffset = 200,
  aspectRatio,
  objectFit = 'cover',
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [isInView, setIsInView] = useState(!initialLoading || initialLoading === 'eager')
  const imgRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  // Calculate aspect ratio if not provided
  const calculatedAspectRatio = aspectRatio || (height / width)

  // Generate CDN URLs with format conversion - memoized to prevent re-renders
  const generateImageUrls = useCallback((baseSrc: string): ImageFormat[] => {
    const urls: ImageFormat[] = []
    const baseUrl = cdnBaseUrl ? `${cdnBaseUrl}${baseSrc}` : baseSrc

    // Generate responsive sizes
    if (responsive) {
      breakpoints.forEach(bp => {
        const scaledHeight = Math.round(bp * calculatedAspectRatio)
        formats.forEach(format => {
          urls.push({
            format,
            src: `${baseUrl}?w=${bp}&h=${scaledHeight}&f=${format}&q=${quality}`,
            width: bp,
            height: scaledHeight,
          })
        })
      })
    } else {
      // Single size with multiple formats
      formats.forEach(format => {
        urls.push({
          format,
          src: `${baseUrl}?w=${width}&h=${height}&f=${format}&q=${quality}`,
          width,
          height,
        })
      })
    }

    return urls
  }, [cdnBaseUrl, responsive, breakpoints, calculatedAspectRatio, formats, quality, width, height])

  // Generate image formats once on mount and when src changes
  const imageFormats = useMemo(() => generateImageUrls(src), [src, generateImageUrls])
  const currentSrc = useMemo(() => imageFormats[0]?.src || src, [imageFormats, src])

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (initialLoading === 'eager' || priority) {
      setIsInView(true)
      return
    }

    if (!imgRef.current) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            if (observerRef.current) {
              observerRef.current.disconnect()
            }
          }
        })
      },
      {
        rootMargin: `${lazyOffset}px`,
        threshold: 0.1,
      }
    )

    observerRef.current.observe(imgRef.current)

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [initialLoading, priority, lazyOffset])

  // Generate blur placeholder
  const generateBlurPlaceholder = useCallback(() => {
    if (blurDataURL) return blurDataURL

    // Create a simple SVG blur placeholder
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="blur">
            <feGaussianBlur stdDeviation="10"/>
          </filter>
        </defs>
        <rect width="100%" height="100%" fill="#f3f4f6" filter="url(#blur)"/>
      </svg>
    `
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
  }, [blurDataURL, width, height])

  const handleLoadingComplete = useCallback(() => {
    setIsLoading(false)
    setHasError(false)
    onLoad?.()
  }, [onLoad])

  const handleError = useCallback(() => {
    setIsLoading(false)
    setHasError(true)

    // Try next format
    const currentIndex = imageFormats.findIndex(f => f.src === currentSrc)
    if (currentIndex < imageFormats.length - 1) {
      setCurrentSrc(imageFormats[currentIndex + 1].src)
      setIsLoading(true)
    } else {
      onErrorProp?.()
    }
  }, [imageFormats, currentSrc, onErrorProp])

  // Generate srcSet for responsive images
  const generateSrcSet = useCallback((format: string) => {
    if (!responsive) return undefined

    const formatImages = imageFormats.filter(f => f.format === format)
    return formatImages
      .map(img => `${img.src} ${img.width}w`)
      .join(', ')
  }, [imageFormats, responsive])

  // Don't render until in view for lazy loading
  if (!isInView) {
    return (
      <div
        ref={imgRef}
        className={cn('relative w-full overflow-hidden bg-muted animate-pulse', className)}
        style={{ aspectRatio: calculatedAspectRatio }}
      />
    )
  }

  return (
    <div
      ref={imgRef}
      className={cn('relative w-full overflow-hidden', className)}
      style={{ aspectRatio: calculatedAspectRatio }}
    >
      {/* Blur placeholder */}
      {isLoading && placeholder === 'blur' && (
        <Image
          src={generateBlurPlaceholder()}
          alt=""
          fill={fill}
          width={!fill ? width : undefined}
          height={!fill ? height : undefined}
          className="absolute inset-0 object-cover scale-110 blur-sm"
          unoptimized
        />
      )}

      {/* Main image with format fallbacks */}
      <picture className="w-full h-full">
        {/* AVIF sources */}
        {formats.includes('avif') && (
          <source
            srcSet={generateSrcSet('avif')}
            sizes={sizes}
            type="image/avif"
          />
        )}

        {/* WebP sources */}
        {formats.includes('webp') && (
          <source
            srcSet={generateSrcSet('webp')}
            sizes={sizes}
            type="image/webp"
          />
        )}

        {/* JPEG fallback */}
        {formats.includes('jpeg') && (
          <source
            srcSet={generateSrcSet('jpeg')}
            sizes={sizes}
            type="image/jpeg"
          />
        )}

        {/* PNG fallback */}
        {formats.includes('png') && (
          <source
            srcSet={generateSrcSet('png')}
            sizes={sizes}
            type="image/png"
          />
        )}

        <Image
          src={currentSrc}
          alt={alt}
          fill={fill}
          width={!fill ? width : undefined}
          height={!fill ? height : undefined}
          quality={quality}
          priority={priority}
          loading={initialLoading}
          sizes={sizes}
          placeholder={placeholder}
          blurDataURL={blurDataURL}
          onLoad={handleLoadingComplete}
          onError={handleError}
          className={cn(
            'transition-opacity duration-300',
            objectFit === 'cover' && 'object-cover',
            objectFit === 'contain' && 'object-contain',
            objectFit === 'fill' && 'object-fill',
            objectFit === 'none' && 'object-none',
            objectFit === 'scale-down' && 'object-scale-down',
            isLoading ? 'opacity-0' : 'opacity-100'
          )}
        />
      </picture>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/80">
          <div className="text-center text-sm text-muted-foreground">
            <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-muted flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-xs">Failed to load image</p>
          </div>
        </div>
      )}
    </div>
  )
}

// Image optimization utilities
export const imageUtils = {
  // Generate responsive image URLs
  generateResponsiveUrls: (
    baseUrl: string,
    breakpoints: number[],
    aspectRatio: number,
    formats: string[] = ['webp', 'avif', 'jpeg'],
    quality: number = 80
  ): ImageFormat[] => {
    const urls: ImageFormat[] = []

    breakpoints.forEach(bp => {
      const height = Math.round(bp * aspectRatio)
      formats.forEach(format => {
        urls.push({
          format,
          src: `${baseUrl}?w=${bp}&h=${height}&f=${format}&q=${quality}`,
          width: bp,
          height,
        })
      })
    })

    return urls
  },

  // Preload critical images
  preloadImage: (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image()
      img.onload = () => resolve()
      img.onerror = reject
      img.src = src
    })
  },

  // Generate blur placeholder from image
  generateBlurDataURL: async (src: string, width: number = 10, height: number = 10): Promise<string> => {
    try {
      // This would typically use a service like Plaiceholder or similar
      // For now, return a simple placeholder
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.fillStyle = '#f3f4f6'
        ctx.fillRect(0, 0, width, height)
        return canvas.toDataURL('image/jpeg', 0.1)
      }
      return ''
    } catch {
      return ''
    }
  },
}
