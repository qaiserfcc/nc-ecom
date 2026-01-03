"use client"

import type React from "react"

import { useState, useCallback, Suspense, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import useSWR from "swr"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { OptimizedImage } from "@/components/optimized-image"
import { VirtualizedProductGrid } from "@/components/virtualized-product-grid"
import { PerformanceMetricsDisplay } from "@/components/performance-metrics-display"
import { useServiceWorker } from "@/lib/hooks/use-service-worker"
import { usePerformanceMonitoring } from "@/lib/hooks/use-performance-monitoring"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Search, Filter, Heart, ShoppingCart, Loader2, X } from "lucide-react"
import { useAuth } from "@/lib/hooks/use-auth"
import { notify } from "@/lib/utils/notifications"
import { ProductCardSkeleton } from "@/components/product-card-skeleton"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

function ShopContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated } = useAuth()

  // Initialize performance monitoring and service worker
  const performanceMonitor = usePerformanceMonitoring()
  const swStatus = useServiceWorker()

  const type = searchParams.get("type") || "products" // Get the type parameter
  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [category, setCategory] = useState(searchParams.get("category") || "all")
  const [brandFilter, setBrandFilter] = useState(searchParams.get("brand") || "all")
  const [priceRange, setPriceRange] = useState([0, 10000])
  const [sortBy, setSortBy] = useState("created_at")
  const [sortOrder, setSortOrder] = useState("desc")
  const [featuredOnly, setFeaturedOnly] = useState(false)
  const [newOnly, setNewOnly] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [offset, setOffset] = useState(0)
  const [allItems, setAllItems] = useState<any[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [prefetchedData, setPrefetchedData] = useState<any>(null)
  const [loadingImages, setLoadingImages] = useState<Record<number, boolean>>({})

  // Build query string
  const buildQuery = useCallback((pageOffset: number = 0) => {
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (category && category !== "all") params.set("category", category)
    if (brandFilter && brandFilter !== "all") params.set("brand", brandFilter)
    if (priceRange[0] > 0) params.set("minPrice", priceRange[0].toString())
    if (priceRange[1] < 10000) params.set("maxPrice", priceRange[1].toString())
    if (sortBy) params.set("sort", sortBy)
    if (sortOrder) params.set("order", sortOrder)
    if (featuredOnly) params.set("featured", "true")
    if (newOnly) params.set("new", "true")
    params.set("limit", "12")
    params.set("offset", pageOffset.toString())
    return params.toString()
  }, [search, category, brandFilter, priceRange, sortBy, sortOrder, featuredOnly, newOnly])

  // Fetch different data based on type
  const getApiEndpoint = () => {
    if (type === "brands") return `/api/brands?${buildQuery(offset)}`
    if (type === "bundles") return `/api/bundles?${buildQuery(offset)}`
    return `/api/products?${buildQuery(offset)}`
  }

  // For brands and bundles, use original endpoint; for products, use optimized flow
  const isProductType = type === "products"
  
  const { data: itemsData, isLoading: itemsLoading } = useSWR(
    isProductType ? `/api/products-lite?${buildQuery(offset)}` : getApiEndpoint(),
    fetcher
  )
  
  // Batch images into groups of 10 to avoid request size limits
  const batchSize = 10
  const productBatches = allItems.length > 0 
    ? Array.from({ length: Math.ceil(allItems.length / batchSize) }).map((_, i) =>
        allItems.slice(i * batchSize, (i + 1) * batchSize).map((p) => p.id).join(",")
      )
    : []
  
  // Fetch images in batches
  const { data: imagesData } = useSWR(
    isProductType && productBatches.length > 0
      ? `/api/products-lite/images?ids=${productBatches[0]}`
      : null,
    fetcher,
    { revalidateOnFocus: false }
  )
  
  // Prefetch next batch of images
  const { data: nextBatchImagesData } = useSWR(
    isProductType && productBatches.length > 1
      ? `/api/products-lite/images?ids=${productBatches[1]}`
      : null,
    fetcher,
    { revalidateOnFocus: false }
  )
  
  // Prefetch next page data
  const { data: nextPageData } = useSWR(
    isProductType && hasMore
      ? `/api/products-lite?${buildQuery(offset + 12)}`
      : null,
    fetcher,
    { revalidateOnFocus: false }
  )
  
  const { data: categoriesData } = useSWR("/api/categories", fetcher)
  const { data: brandsData } = useSWR("/api/brands", fetcher)

  // State to track loaded images
  const [productImages, setProductImages] = useState<Record<number, any[]>>({})

  // Handle image data when it arrives (batch 1)
  useEffect(() => {
    if (imagesData?.images) {
      setProductImages((prev) => ({ ...prev, ...imagesData.images }))
    }
  }, [imagesData])
  
  // Handle next batch images when they arrive
  useEffect(() => {
    if (nextBatchImagesData?.images) {
      setProductImages((prev) => ({ ...prev, ...nextBatchImagesData.images }))
    }
  }, [nextBatchImagesData])

  // Handle pagination - append new items to existing ones
  useEffect(() => {
    if (itemsData) {
      if (offset === 0) {
        // First page, replace all items
        const newItems = type === "brands" 
          ? (itemsData?.brands || [])
          : type === "bundles"
          ? (itemsData?.bundles || [])
          : (itemsData?.products || [])
        setAllItems(newItems)
      } else {
        // Append new items
        const newItems = type === "brands" 
          ? (itemsData?.brands || [])
          : type === "bundles"
          ? (itemsData?.bundles || [])
          : (itemsData?.products || [])
        setAllItems(prev => [...prev, ...newItems])
      }
      // Check if there are more items
      setHasMore(itemsData?.pagination?.hasMore || false)
    }
  }, [itemsData, offset, type])
  
  // Load remaining image batches lazily with improved error handling
  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    let errorShown = false
    let retryCount = 0
    const MAX_RETRIES = 2
    
    if (productBatches.length > 2) {
      // Load remaining batches after a delay
      timeoutId = setTimeout(() => {
        const remainingBatches = productBatches.slice(2)
        
        const loadBatchesWithRetry = async (batchIndex: number) => {
          if (batchIndex >= remainingBatches.length) return
          
          const batch = remainingBatches[batchIndex]
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout
          
          try {
            const res = await fetch(`/api/products-lite/images?ids=${batch}`, {
              signal: controller.signal,
              headers: {
                'Accept': 'image/webp,image/*,*/*;q=0.8',
              }
            })
            
            clearTimeout(timeoutId)
            
            if (!res.ok) {
              throw new Error(`HTTP ${res.status}`)
            }
            
            const data = await res.json()
            if (data?.images) {
              setProductImages((prev) => ({ ...prev, ...data.images }))
            }
            
            // Load next batch
            loadBatchesWithRetry(batchIndex + 1)
          } catch (err) {
            clearTimeout(timeoutId)
            console.error(`Error loading image batch ${batchIndex}:`, err)
            
            // Retry failed batch if not maxed out
            if (retryCount < MAX_RETRIES) {
              retryCount++
              setTimeout(() => {
                loadBatchesWithRetry(batchIndex)
              }, 2000 * retryCount) // Exponential backoff
            } else if (!errorShown) {
              // Only show error once after retries exhausted
              notify.warning(
                "Loading images",
                "Some images may take longer to appear. Check your connection."
              )
              errorShown = true
              // Continue loading remaining batches
              loadBatchesWithRetry(batchIndex + 1)
            }
          }
        }
        
        loadBatchesWithRetry(0)
      }, 500) // Delay remaining batch loads
    }
    
    return () => clearTimeout(timeoutId)
  }, [productBatches])
  
  // Prefetch next page on demand
  const prefetchNextPage = useCallback(() => {
    if (hasMore && !itemsLoading && nextPageData) {
      const newItems = nextPageData?.products || []
      setPrefetchedData(newItems)
    }
  }, [hasMore, itemsLoading, nextPageData])
  
  useEffect(() => {
    prefetchNextPage()
  }, [prefetchNextPage])
  
  const categories = categoriesData?.categories || []
  const brands = brandsData?.brands || []

  // Reset pagination when filters change
  useEffect(() => {
    setOffset(0)
    setAllItems([])
  }, [search, category, brandFilter, priceRange, sortBy, sortOrder, featuredOnly, newOnly])

  // Page title based on type
  const pageTitle = type === "brands" 
    ? "Our Brands" 
    : type === "bundles" 
    ? "Product Bundles" 
    : "Shop All Products"

  const handleAddToCart = async (productId: number, e: React.MouseEvent) => {
    e.preventDefault()
    if (!isAuthenticated) {
      router.push("/signin")
      return
    }
    try {
      await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId, quantity: 1 }),
      })
      notify.success("Added to cart")
    } catch (error) {
      notify.error("Failed to add to cart")
    }
  }

  const handleAddToWishlist = async (productId: number, e: React.MouseEvent) => {
    e.preventDefault()
    if (!isAuthenticated) {
      router.push("/signin")
      return
    }
    try {
      await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId }),
      })
      notify.success("Added to wishlist")
    } catch (error) {
      notify.error("Failed to add to wishlist")
    }
  }

  const clearFilters = () => {
    setSearch("")
    setCategory("all")
    setBrandFilter("all")
    setPriceRange([0, 10000])
    setSortBy("created_at")
    setSortOrder("desc")
    setFeaturedOnly(false)
    setNewOnly(false)
    setOffset(0) // Reset pagination
  }

  const FilterPanel = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3">Categories</h3>
        <div className="space-y-2">
          <Button
            variant={category === "all" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setCategory("all")}
          >
            All Products
          </Button>
          {categories.map((cat: any) => (
            <Button
              key={cat.id}
              variant={category === cat.slug ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setCategory(cat.slug)}
            >
              {cat.name} ({cat.product_count})
            </Button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Brands</h3>
        <div className="space-y-2">
          <Button
            variant={brandFilter === "all" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setBrandFilter("all")}
          >
            All Brands
          </Button>
          {brands.map((brand: any) => (
            <Button
              key={brand.id}
              variant={brandFilter === brand.slug ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setBrandFilter(brand.slug)}
            >
              {brand.name}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Price Range</h3>
        <Slider value={priceRange} min={0} max={10000} step={100} onValueChange={setPriceRange} className="mb-2" />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Rs. {priceRange[0]}</span>
          <span>Rs. {priceRange[1]}</span>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Filters</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Checkbox id="featured" checked={featuredOnly} onCheckedChange={(c) => setFeaturedOnly(c as boolean)} />
            <label htmlFor="featured" className="text-sm cursor-pointer">
              Featured Products
            </label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="new" checked={newOnly} onCheckedChange={(c) => setNewOnly(c as boolean)} />
            <label htmlFor="new" className="text-sm cursor-pointer">
              New Arrivals
            </label>
          </div>
        </div>
      </div>

      <Button variant="outline" className="w-full bg-transparent" onClick={clearFilters}>
        <X className="w-4 h-4 mr-2" />
        Clear Filters
      </Button>
    </div>
  )

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Desktop Filters Sidebar */}
            <aside className="hidden md:block w-64 shrink-0">
              <FilterPanel />
            </aside>

            {/* Main Content */}
            <div className="flex-1">
              {/* Search and Sort Bar */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder={`Search ${type}...`}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="created_at">Newest</SelectItem>
                      {type === "products" && <SelectItem value="current_price">Price</SelectItem>}
                      {type === "bundles" && <SelectItem value="bundle_price">Price</SelectItem>}
                      <SelectItem value="name">Name</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={sortOrder} onValueChange={setSortOrder}>
                    <SelectTrigger className="w-[100px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">Asc</SelectItem>
                      <SelectItem value="desc">Desc</SelectItem>
                    </SelectContent>
                  </Select>
                  {/* Mobile Filter Button - Only for products */}
                  {type === "products" && (
                    <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
                      <SheetTrigger asChild>
                        <Button variant="outline" className="md:hidden bg-transparent">
                          <Filter className="w-4 h-4" />
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="left">
                        <SheetHeader>
                          <SheetTitle>Filters</SheetTitle>
                        </SheetHeader>
                        <div className="mt-6">
                          <FilterPanel />
                        </div>
                      </SheetContent>
                    </Sheet>
                  )}
                </div>
              </div>

              {/* Results Count */}
              <p className="text-sm text-muted-foreground mb-4">
                {allItems.length > 0 
                  ? `Showing ${allItems.length} of ${itemsData?.pagination?.total || allItems.length}`
                  : `${itemsData?.pagination?.total || 0}`} {type === "brands" ? "brands" : type === "bundles" ? "bundles" : "products"} found
              </p>

              {/* Items Grid */}
              {itemsLoading && offset === 0 ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : allItems.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-muted-foreground">No {type} found</p>
                  {type === "products" && (
                    <Button variant="link" onClick={clearFilters}>
                      Clear filters
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {type === "brands" ? (
                      // Render Brands
                      allItems.map((brand: any) => (
                        <a key={brand.id} href={brand.website_url} target="_blank" rel="noopener noreferrer">
                          <Card className="group overflow-hidden hover:shadow-lg transition-shadow h-full">
                            <div className="relative aspect-square overflow-hidden bg-muted flex items-center justify-center p-8">
                              <Image
                                src={brand.logo_url || "/placeholder.svg?height=200&width=200"}
                                alt={brand.name}
                                width={200}
                                height={200}
                                className="object-contain group-hover:scale-105 transition-transform"
                                loading="lazy"
                              />
                              {brand.is_featured && (
                                <Badge className="absolute top-2 right-2 bg-secondary text-secondary-foreground">Featured</Badge>
                              )}
                            </div>
                            <CardContent className="p-4">
                              <h3 className="font-semibold text-lg mb-2">{brand.name}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-2">{brand.description}</p>
                            </CardContent>
                          </Card>
                        </a>
                      ))
                    ) : type === "bundles" ? (
                      // Render Bundles
                      allItems.map((bundle: any) => (
                        <Link key={bundle.id} href={`/product/bundle-${bundle.id}`}>
                          <Card className="group overflow-hidden hover:shadow-lg transition-shadow h-full">
                            <div className="relative aspect-square overflow-hidden bg-muted">
                              <Image
                                src={bundle.image_url || "/placeholder.svg?height=300&width=300"}
                                alt={bundle.name}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform"
                                loading="lazy"
                              />
                              <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">Bundle</Badge>
                              {bundle.original_price && bundle.original_price > bundle.bundle_price && (
                                <Badge variant="destructive" className="absolute top-2 right-2">
                                  Save Rs. {(bundle.original_price - bundle.bundle_price).toLocaleString()}
                                </Badge>
                              )}
                            </div>
                            <CardContent className="p-3">
                              <h3 className="font-medium text-sm line-clamp-2 mb-2">{bundle.name}</h3>
                              <p className="text-xs text-muted-foreground line-clamp-1 mb-2">{bundle.description}</p>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-primary">
                                  Rs. {Number(bundle.bundle_price).toLocaleString()}
                                </span>
                                {bundle.original_price && bundle.original_price > bundle.bundle_price && (
                                  <span className="text-xs text-muted-foreground line-through">
                                    Rs. {Number(bundle.original_price).toLocaleString()}
                                  </span>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      ))
                    ) : (
                      // Render Products - with images loaded from separate endpoint
                      <>
                        {allItems.map((product: any) => {
                          const productImageList = productImages[product.id] || []
                          const primaryImage = productImageList.find((img: any) => img.is_primary) || productImageList[0]
                          
                          // Get image URL with fallback chain
                          const imageUrl = primaryImage?.image_url || "/placeholder.svg?height=300&width=300"
                          const fallbackUrls = primaryImage?.format_options || ["/placeholder.svg?height=300&width=300"]
                          
                          return (
                            <Link key={product.id} href={`/product/${product.slug}`}>
                              <Card className="group overflow-hidden hover:shadow-lg transition-shadow h-full">
                                <div className="relative aspect-square overflow-hidden bg-muted">
                                  {!productImages[product.id] ? (
                                    <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50" />
                                  ) : (
                                    <OptimizedImage
                                      src={imageUrl}
                                      alt={product.name}
                                      fill
                                      className="group-hover:scale-105 transition-transform"
                                      loading="lazy"
                                      onLoad={() => performanceMonitor.recordImageLoad(Date.now())}
                                      onError={() => {
                                        console.warn(`Image load error for product: ${product.name}`)
                                      }}
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
                                      onClick={(e) => handleAddToWishlist(product.id, e)}
                                    >
                                      <Heart className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="secondary"
                                      className="h-8 w-8"
                                      onClick={(e) => handleAddToCart(product.id, e)}
                                    >
                                      <ShoppingCart className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                                <CardContent className="p-3">
                                  <p className="text-xs text-muted-foreground mb-1">{product.category_name}</p>
                                  <h3 className="font-medium text-sm line-clamp-2 mb-2">{product.name}</h3>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-primary">
                                      Rs. {Number(product.current_price).toLocaleString()}
                                    </span>
                                    <span className="text-xs text-muted-foreground line-through">
                                      Rs. {Number(product.original_price).toLocaleString()}
                                    </span>
                                    <Badge variant="secondary" className="text-[11px] px-2 py-0">
                                      {Math.max(
                                        0,
                                        Math.round(
                                          ((Number(product.original_price) - Number(product.current_price)) / Number(product.original_price || 1)) *
                                            100,
                                        ),
                                      )}%
                                    </Badge>
                                  </div>
                                </CardContent>
                              </Card>
                            </Link>
                          )
                        })}
                        {/* Show skeleton loaders while loading more products */}
                        {itemsLoading && (
                          <>
                            {Array.from({ length: 4 }).map((_, i) => (
                              <ProductCardSkeleton key={`skeleton-${i}`} />
                            ))}
                          </>
                        )}
                      </>
                    )}
                  </div>
                  {hasMore && (
                    <div className="flex justify-center mt-8">
                      <Button
                        onClick={() => {
                          setOffset(offset + 12)
                          // Use prefetched data if available
                          if (prefetchedData) {
                            setAllItems(prev => [...prev, ...prefetchedData])
                            setPrefetchedData(null)
                          }
                        }}
                        disabled={itemsLoading}
                        size="lg"
                      >
                        {itemsLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          "Load More"
                        )}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
      
      {/* Performance Metrics Display - Only in development */}
      {process.env.NODE_ENV === 'development' && (
        <PerformanceMetricsDisplay
          metrics={performanceMonitor.getMetrics()}
          logMetrics={performanceMonitor.logMetrics}
          clearCache={swStatus.clearCache}
          swIsRegistered={swStatus.isRegistered}
        />
      )}
    </>
  )
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  )
}
