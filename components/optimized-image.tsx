'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
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
  onLoad?: () => void
  onError?: () => void
}

export function OptimizedImage({
  src,
  alt,
  className,
  fill,
  priority,
  loading = 'lazy',
  width,
  height,
  quality = 75,
  onLoad,
  onError: onErrorProp,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [currentImageUrl, setCurrentImageUrl] = useState(src)
  const [imageSource, setImageSource] = useState<'original' | 'webp' | 'jpeg' | 'placeholder'>('original')

  const MAX_RETRIES = 3
  const RETRY_DELAY = 1000 // 1 second

  // Validate image URL and return fallback sources
  const getFallbackSources = (imageUrl: string) => {
    if (!imageUrl || imageUrl.includes('placeholder')) {
      return ['/placeholder.svg?height=300&width=300']
    }

    const sources: string[] = []
    
    // Add original URL
    if (imageUrl && !imageUrl.startsWith('/')) {
      sources.push(imageUrl)
    }
    
    // Try WebP if not already WebP
    if (!imageUrl.endsWith('.webp')) {
      const webpUrl = imageUrl.substring(0, imageUrl.lastIndexOf('.')) + '.webp'
      if (webpUrl !== imageUrl) {
        sources.push(webpUrl)
      }
    }
    
    // Try JPEG conversion
    if (!imageUrl.endsWith('.jpg') && !imageUrl.endsWith('.jpeg')) {
      const jpegUrl = imageUrl.substring(0, imageUrl.lastIndexOf('.')) + '.jpg'
      if (jpegUrl !== imageUrl) {
        sources.push(jpegUrl)
      }
    }
    
    // Always add placeholder as last resort
    sources.push('/placeholder.svg?height=300&width=300')
    
    return sources
  }

  const fallbackSources = getFallbackSources(src)

  // Preload image to check if it exists
  useEffect(() => {
    if (!src || src.includes('placeholder')) {
      setCurrentImageUrl(fallbackSources[fallbackSources.length - 1])
      setImageSource('placeholder')
      return
    }

    let isMounted = true
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    const preloadImage = async () => {
      try {
        // Check if image exists by fetching headers
        const response = await fetch(src, {
          method: 'HEAD',
          signal: controller.signal,
        })
        
        if (isMounted) {
          if (response.ok) {
            setCurrentImageUrl(src)
            setImageSource('original')
          } else {
            // Image not found, try fallbacks
            tryNextFallback(0)
          }
        }
      } catch (error) {
        if (isMounted) {
          console.warn(`Image preload failed for ${src}:`, error)
          tryNextFallback(0)
        }
      } finally {
        clearTimeout(timeoutId)
      }
    }

    preloadImage()

    return () => {
      isMounted = false
      controller.abort()
      clearTimeout(timeoutId)
    }
  }, [src, fallbackSources])

  // Try next fallback source
  const tryNextFallback = (index: number) => {
    if (index < fallbackSources.length) {
      const nextUrl = fallbackSources[index]
      setCurrentImageUrl(nextUrl)
      
      if (nextUrl.includes('placeholder')) {
        setImageSource('placeholder')
      } else if (nextUrl.endsWith('.webp')) {
        setImageSource('webp')
      } else if (nextUrl.endsWith('.jpg') || nextUrl.endsWith('.jpeg')) {
        setImageSource('jpeg')
      }
    }
  }

  const handleLoadingComplete = () => {
    setIsLoading(false)
    setHasError(false)
    setRetryCount(0) // Reset retry count on successful load
    onLoad?.()
  }

  const handleError = () => {
    setIsLoading(false)
    
    // Try next fallback
    const sourceIndex = fallbackSources.indexOf(currentImageUrl)
    if (sourceIndex < fallbackSources.length - 1) {
      // Try next fallback without incrementing retry counter
      tryNextFallback(sourceIndex + 1)
      setIsLoading(true) // Re-attempt load
    } else if (retryCount < MAX_RETRIES) {
      // Retry current image after delay
      setTimeout(() => {
        setRetryCount(prev => prev + 1)
        setIsLoading(true)
      }, RETRY_DELAY * (retryCount + 1))
    } else {
      // All retries exhausted
      setHasError(true)
      console.error(`Image failed to load after ${MAX_RETRIES} retries: ${src}`)
      onErrorProp?.()
    }
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Blur placeholder while loading */}
      {isLoading && !hasError && (
        <div
          className={cn(
            'absolute inset-0 bg-gradient-to-br from-muted via-muted/70 to-muted/50',
            'animate-pulse z-0',
            fill && 'w-full h-full'
          )}
          style={{
            backdropFilter: 'blur(10px)',
          }}
        />
      )}

      {/* Main image with key to force re-render on source change */}
      <Image
        key={`${currentImageUrl}-${retryCount}`}
        src={currentImageUrl}
        alt={alt}
        fill={fill}
        width={width}
        height={height}
        quality={quality}
        priority={priority}
        loading={loading}
        onLoadingComplete={handleLoadingComplete}
        onError={handleError}
        className={cn(
          'object-cover transition-opacity duration-300',
          isLoading && !hasError ? 'opacity-0' : 'opacity-100',
          imageSource === 'placeholder' && 'object-contain p-4'
        )}
        sizes={
          fill
            ? '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
            : undefined
        }
        unoptimized={imageSource === 'placeholder'}
      />

      {/* Skeleton loading state */}
      {isLoading && !hasError && (
        <div
          className={cn(
            'absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent',
            'animate-shimmer z-1'
          )}
          style={{
            animation: 'shimmer 2s infinite',
          }}
        />
      )}

      {/* Error state with source info */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
          <div className="text-center text-xs text-muted-foreground">
            <p>Unable to load</p>
            <p className="text-[10px] mt-1 font-mono truncate max-w-[90%]">{imageSource}</p>
          </div>
        </div>
      )}
    </div>
  )
}

// Add keyframe animation via CSS-in-JS
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = `
    @keyframes shimmer {
      0% {
        transform: translateX(-100%);
      }
      100% {
        transform: translateX(100%);
      }
    }
  `
  document.head.appendChild(style)
}
