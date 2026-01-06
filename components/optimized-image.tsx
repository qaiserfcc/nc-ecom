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
      return ['/placeholder.svg']
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
    sources.push('/placeholder.svg')
    
    return sources
  }

  const fallbackSources = getFallbackSources(src)

  // Preload image to check if it exists
  useEffect(() => {
    if (!src || src.includes('placeholder')) {
      setCurrentImageUrl(fallbackSources[fallbackSources.length - 1])
      setImageSource('placeholder')
      setIsLoading(false)
      return
    }

    // Directly use the src without preload checks - let Next.js Image handle it
    setCurrentImageUrl(src)
    setImageSource('original')
  }, [src, fallbackSources])

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
      const nextIndex = sourceIndex + 1
      const nextUrl = fallbackSources[nextIndex]
      setCurrentImageUrl(nextUrl)
      
      if (nextUrl.includes('placeholder')) {
        setImageSource('placeholder')
        setHasError(false)
      } else if (nextUrl.endsWith('.webp')) {
        setImageSource('webp')
      } else if (nextUrl.endsWith('.jpg') || nextUrl.endsWith('.jpeg')) {
        setImageSource('jpeg')
      }
      setIsLoading(true) // Re-attempt load
    } else {
      // Already at placeholder, stop trying
      setHasError(false)
      setImageSource('placeholder')
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
