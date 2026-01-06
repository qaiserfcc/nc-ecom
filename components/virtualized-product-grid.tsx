'use client'

import React, { useCallback, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { OptimizedImage } from '@/components/optimized-image'
import { cn } from '@/lib/utils'

interface VirtualizedProductGridProps {
  items: any[]
  isLoading: boolean
  productImages: Record<number, any[]>
  onAddToCart?: (productId: number, e: React.MouseEvent) => void
  onAddToWishlist?: (productId: number, e: React.MouseEvent) => void
  itemHeight?: number
  columnCount?: number
}

// Simple virtual scrolling implementation without external dependency
export function VirtualizedProductGrid({
  items,
  isLoading,
  productImages,
  onAddToCart,
  onAddToWishlist,
  itemHeight = 400,
  columnCount = 1,
}: VirtualizedProductGridProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = React.useState(0)
  const [containerHeight, setContainerHeight] = React.useState(0)

  // Calculate visible items
  const visibleRange = useMemo(() => {
    if (containerHeight === 0) return { start: 0, end: items.length }

    const bufferSize = 3 // Number of items to render outside visible area
    const itemsPerRow = columnCount
    const rowHeight = itemHeight
    const visibleRows = Math.ceil(containerHeight / rowHeight) + bufferSize

    const startRow = Math.max(0, Math.floor(scrollTop / rowHeight) - bufferSize)
    const endRow = startRow + visibleRows

    const start = startRow * itemsPerRow
    const end = Math.min(items.length, endRow * itemsPerRow)

    return { start, end, startRow, endRow }
  }, [scrollTop, containerHeight, items.length, itemHeight, columnCount])

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end)
  }, [items, visibleRange])

  const offsetY = useMemo(() => {
    return (visibleRange.startRow * itemHeight) || 0
  }, [visibleRange.startRow, itemHeight])

  const totalHeight = useMemo(() => {
    const rowCount = Math.ceil(items.length / columnCount)
    return rowCount * itemHeight
  }, [items.length, columnCount, itemHeight])

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget
    setScrollTop(target.scrollTop)

    // Prefetch images for items coming into view
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      const images = target.querySelectorAll('img')
      images.forEach((img) => {
        if (!img.src && img.dataset.src) {
          img.src = img.dataset.src
        }
      })
    }
  }, [])

  React.useEffect(() => {
    if (containerRef.current) {
      setContainerHeight(containerRef.current.clientHeight)
    }

    const handleResize = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.clientHeight)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <Card key={i} className="group overflow-hidden h-[400px]">
            <div className="w-full h-48 bg-muted animate-pulse" />
          </Card>
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <p className="text-muted-foreground">No products found</p>
      </div>
    )
  }

  // For smaller lists, use regular grid
  if (items.length < 50) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            productImages={productImages}
            onAddToCart={onAddToCart}
            onAddToWishlist={onAddToWishlist}
          />
        ))}
      </div>
    )
  }

  // For large lists, use virtualized grid
  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-y-auto scrollbar-hide"
      onScroll={handleScroll}
      style={{
        height: 'calc(100vh - 300px)',
      }}
    >
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4"
        style={{
          height: totalHeight,
          position: 'relative',
        }}
      >
        {/* Spacer for items before visible range */}
        <div
          style={{
            gridColumn: '1 / -1',
            height: offsetY,
            pointerEvents: 'none',
          }}
        />

        {/* Visible items */}
        {visibleItems.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            productImages={productImages}
            onAddToCart={onAddToCart}
            onAddToWishlist={onAddToWishlist}
          />
        ))}

        {/* Spacer for items after visible range */}
        <div
          style={{
            gridColumn: '1 / -1',
            height: Math.max(0, totalHeight - offsetY - (visibleRange.end * itemHeight)),
            pointerEvents: 'none',
          }}
        />
      </div>
    </div>
  )
}

// Extracted product card component
function ProductCard({
  product,
  productImages,
  onAddToCart,
  onAddToWishlist,
}: {
  product: any
  productImages: Record<number, any[]>
  onAddToCart?: (productId: number, e: React.MouseEvent) => void
  onAddToWishlist?: (productId: number, e: React.MouseEvent) => void
}) {
  const productImageList = productImages[product.id] || []
  const primaryImage = productImageList.find((img: any) => img.is_primary) || productImageList[0]
  const imageUrl = primaryImage?.image_url || "/placeholder.svg"
  const originalUrl = primaryImage?.original_url || imageUrl

  return (
    <Link key={product.id} href={`/product/${product.slug}`}>
      <Card className="group overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
        <div className="relative aspect-square overflow-hidden bg-muted flex-shrink-0">
          {!productImages[product.id] ? (
            <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50" />
          ) : (
            <OptimizedImage
              src={imageUrl}
              alt={product.name}
              width={300}
              height={300}
              className="group-hover:scale-105 transition-transform w-full h-full"
              loading="lazy"
            />
          )}
          {product.is_new_arrival && (
            <Badge className="absolute top-2 left-2 bg-secondary text-secondary-foreground">New</Badge>
          )}
          {product.original_price > product.current_price && (
            <Badge variant="destructive" className="absolute top-2 right-2">
              {Math.round(
                ((product.original_price - product.current_price) / product.original_price) * 100,
              )}
              % OFF
            </Badge>
          )}
          <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8"
              onClick={(e) => onAddToWishlist?.(product.id, e)}
            >
              ♡
            </Button>
          </div>
        </div>

        <div className="flex flex-col flex-grow p-4">
          <h3 className="font-semibold text-sm line-clamp-2 flex-grow">{product.name}</h3>
          
          <div className="flex items-center gap-2 mt-2">
            <span className="text-lg font-bold">${product.current_price.toFixed(2)}</span>
            {product.original_price > product.current_price && (
              <span className="text-sm text-muted-foreground line-through">
                ${product.original_price.toFixed(2)}
              </span>
            )}
          </div>

          <Button
            className="w-full mt-auto"
            variant="default"
            size="sm"
            onClick={(e) => onAddToCart?.(product.id, e)}
          >
            Add to Cart
          </Button>
        </div>
      </Card>
    </Link>
  )
}
