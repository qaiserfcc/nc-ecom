'use client'

import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react'
/* stylelint-disable */
import Link from 'next/link'
import Image from 'next/image'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { OptimizedImage } from '@/components/optimized-image'
import { cn } from '@/lib/utils'
import { Grid } from 'react-window'

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
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState<number>(0)
  const [columns, setColumns] = useState<number>(columnCount)

  // Measure container width using ResizeObserver
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = Math.floor(entry.contentRect.width)
        setContainerWidth(width)
        // Responsive columns similar to Tailwind breakpoints
        if (width >= 1280) setColumns(4)
        else if (width >= 1024) setColumns(3)
        else if (width >= 640) setColumns(2)
        else setColumns(1)
      }
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Derive column width from container width and gap
  const gap = 24 // matches gap-6
  const columnWidth = useMemo(() => {
    if (containerWidth === 0) return 300
    const totalGap = gap * (columns - 1)
    return Math.floor((containerWidth - totalGap) / columns)
  }, [containerWidth, columns])

  const rowCount = useMemo(() => Math.ceil(items.length / columns), [items.length, columns])

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

  return (
    <div ref={containerRef} className="w-full h-[calc(100vh-300px)]">
      {containerWidth > 0 ? (
        <Grid
          columnCount={columns}
          columnWidth={columnWidth}
          defaultHeight={Math.max(400, typeof window !== 'undefined' ? Math.floor(window.innerHeight - 300) : 600)}
          rowCount={rowCount}
          rowHeight={itemHeight}
          defaultWidth={containerWidth}
          className={cn('px-4')}
          cellComponent={function GridCell(props: any) {
            const { columnIndex, rowIndex, style, ...rest } = props
            const index = rowIndex * columns + columnIndex
            const r = useRef<HTMLDivElement>(null)
            useEffect(() => {
              const el = r.current
              if (!el) return
              for (const key of Object.keys(style || {})) {
                // @ts-ignore
                el.style[key] = style[key]
              }
            }, [style])

            if (index >= items.length) return <div ref={r} />

            const product = items[index]
            return (
              <div ref={r} className="p-3">
                <ProductCard
                  key={product.id}
                  product={product}
                  productImages={productImages}
                  onAddToCart={onAddToCart}
                  onAddToWishlist={onAddToWishlist}
                />
              </div>
            )
          }}
          cellProps={{}}
        />
      ) : (
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
      )}
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
    <Link key={product.id} href={`/product/${product.id}`}>
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
