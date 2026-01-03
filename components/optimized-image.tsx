'use client'

import Image from 'next/image'
import { useState } from 'react'
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
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  // Get primary image source (prefer WebP)
  const getImageSrc = (imageUrl: string) => {
    // If it's a placeholder, return as-is
    if (imageUrl.includes('placeholder')) return imageUrl
    
    // Try to use WebP version if available
    // For now, return original URL - backend will handle format negotiation
    return imageUrl
  }

  const imageSrc = getImageSrc(src)
  const fallbackSrc = '/placeholder.svg?height=300&width=300'

  const handleLoadingComplete = () => {
    setIsLoading(false)
    setHasError(false)
    onLoad?.()
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
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

      {/* Main image */}
      <Image
        src={hasError ? fallbackSrc : imageSrc}
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
          isLoading && !hasError ? 'opacity-0' : 'opacity-100'
        )}
        sizes={
          fill
            ? '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
            : undefined
        }
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
