"use client"

import type React from "react"

import { useState, useCallback, Suspense, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import useSWR, { useSWRConfig } from "swr"
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
  const { cache } = useSWRConfig()

  // Initialize performance monitoring and service worker
  const performanceMonitor = usePerformanceMonitoring()
  const swStatus = useServiceWorker()

  const type = searchParams.get("type") || "products" // Get the type parameter
  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [category, setCategory] = useState(searchParams.get("category") || "all")
  const [brandFilter, setBrandFilter] = useState(searchParams.get("brand") || "all")
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000])
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

  // Memoize the current query string to detect changes
  const currentQueryKey = buildQuery(offset)

  // Fetch different data based on type
  const getApiEndpoint = () => {
    if (type === "brands") return `/api/brands?${buildQuery(offset)}`
    if (type === "bundles") return `/api/bundles?${buildQuery(offset)}`
    return `/api/products?${buildQuery(offset)}`
  }

  // For brands and bundles, use original endpoint; for products, use optimized flow
  const isProductType = type === "products"
  const swrUrl = isProductType ? `/api/products-lite?${currentQueryKey}` : getApiEndpoint()
  
  const { data: itemsData, isLoading: itemsLoading } = useSWR(
    swrUrl,
    fetcher
  )
  
  // Clear SWR cache for this query when filters change (but preserve offset for pagination)
  useEffect(() => {
    if (isProductType && offset === 0) {
      // Clear the cache for the base query to force refetch
      if (cache.has(swrUrl)) {
        cache.delete(swrUrl)
      }
    }
  }, [search, category, brandFilter, sortBy, sortOrder, featuredOnly, newOnly, isProductType, swrUrl, cache])
  
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
  const { data: discountData } = useSWR("/api/discounts/active", fetcher)

  const categories = categoriesData?.categories || []
  const mainCategories = categories.filter((cat: any) => !cat.parent_category_id)
  const subcategories = categories.filter((cat: any) => cat.parent_category_id)

  const selectedCategoryObj = category !== "all" ? categories.find((c: any) => c.slug === category) : null
  const activeMainCategoryId = selectedCategoryObj
    ? selectedCategoryObj.parent_category_id
      ? selectedCategoryObj.parent_category_id
      : selectedCategoryObj.id
    : null

  const activeMainSubcategories = activeMainCategoryId
    ? subcategories.filter((c: any) => c.parent_category_id === activeMainCategoryId)
    : []

  const activeDiscount = discountData?.discount

  // Helper to calculate discounted price
  const calculateDiscountedPrice = (price: number) => {
    if (!activeDiscount) return price
    
    if (activeDiscount.discount_type === "percentage") {
      return price - (price * activeDiscount.discount_value) / 100
    } else {
      return Math.max(0, price - activeDiscount.discount_value)
    }
  }

  const formatPrice = (value: number) => `Rs. ${Math.round(value).toLocaleString()}`

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
  
  const brands = brandsData?.brands || []

  // Reset pagination when filters change
  useEffect(() => {
    setOffset(0)
    setAllItems([])
  }, [search, category, brandFilter, priceRange[0], priceRange[1], sortBy, sortOrder, featuredOnly, newOnly])

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
        <h3 className="font-bold mb-4 text-primary text-sm uppercase tracking-wide">Categories</h3>
        <div className="space-y-2">
          <Button
            variant={category === "all" ? "default" : "ghost"}
            className={`w-full justify-start rounded-xl transition-all ${
              category === "all" 
                ? "bg-secondary text-primary hover:bg-secondary/80" 
                : "text-gray-600 hover:text-primary hover:bg-gray-50"
            }`}
            onClick={() => setCategory("all")}
          >
            All Products
          </Button>
          {mainCategories.map((parent: any) => {
            const children = subcategories.filter((c: any) => c.parent_category_id === parent.id)
            return (
              <div key={parent.id} className="space-y-2">
                <Button
                  variant={activeMainCategoryId === parent.id ? "default" : "ghost"}
                  className={`w-full justify-start rounded-xl transition-all ${
                    activeMainCategoryId === parent.id 
                      ? "bg-secondary text-primary hover:bg-secondary/80" 
                      : "text-gray-600 hover:text-primary hover:bg-gray-50"
                  }`}
                  onClick={() => setCategory(parent.slug)}
                >
                  {parent.name} <span className="ml-auto text-xs opacity-70">({parent.product_count})</span>
                </Button>

                {children.length > 0 && (
                  <div className="pt-2 pl-4 border-l border-gray-100 space-y-2">
                    {children.map((child: any) => (
                      <Button
                        key={child.id}
                        variant={category === child.slug ? "default" : "ghost"}
                        className={`w-full justify-start rounded-xl transition-all ${
                          category === child.slug
                            ? "bg-secondary text-primary hover:bg-secondary/80"
                            : "text-gray-600 hover:text-primary hover:bg-gray-50"
                        }`}
                        onClick={() => setCategory(child.slug)}
                      >
                        {child.name} <span className="ml-auto text-xs opacity-70">({child.product_count})</span>
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="border-t border-gray-100 pt-6">
        <h3 className="font-bold mb-4 text-primary text-sm uppercase tracking-wide">Brands</h3>
        <div className="space-y-2">
          <Button
            variant={brandFilter === "all" ? "default" : "ghost"}
            className={`w-full justify-start rounded-xl transition-all ${
              brandFilter === "all" 
                ? "bg-secondary text-primary hover:bg-secondary/80" 
                : "text-gray-600 hover:text-primary hover:bg-gray-50"
            }`}
            onClick={() => setBrandFilter("all")}
          >
            All Brands
          </Button>
          {brands.map((brand: any) => (
            <Button
              key={brand.id}
              variant={brandFilter === brand.slug ? "default" : "ghost"}
              className={`w-full justify-start rounded-xl transition-all ${
                brandFilter === brand.slug 
                  ? "bg-secondary text-primary hover:bg-secondary/80" 
                  : "text-gray-600 hover:text-primary hover:bg-gray-50"
              }`}
              onClick={() => setBrandFilter(brand.slug)}
            >
              {brand.name}
            </Button>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-100 pt-6">
        <h3 className="font-bold mb-4 text-primary text-sm uppercase tracking-wide">Price Range</h3>
        <Slider value={priceRange} min={0} max={10000} step={100} onValueChange={setPriceRange} className="mb-4" />
        <div className="flex justify-between text-sm text-gray-600 font-medium">
          <span>Rs. {priceRange[0]}</span>
          <span>Rs. {priceRange[1]}</span>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-6">
        <h3 className="font-bold mb-4 text-primary text-sm uppercase tracking-wide">Filters</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
            <Checkbox id="featured" checked={featuredOnly} onCheckedChange={(c) => setFeaturedOnly(c as boolean)} />
            <label htmlFor="featured" className="text-sm cursor-pointer flex-1 text-gray-700">
              Featured Products
            </label>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
            <Checkbox id="new" checked={newOnly} onCheckedChange={(c) => setNewOnly(c as boolean)} />
            <label htmlFor="new" className="text-sm cursor-pointer flex-1 text-gray-700">
              New Arrivals
            </label>
          </div>
        </div>
      </div>

      <Button 
        variant="outline" 
        className="w-full rounded-xl border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-primary hover:border-primary transition-all" 
        onClick={clearFilters}
      >
        <X className="w-4 h-4 mr-2" />
        Clear Filters
      </Button>
    </div>
  )

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#fcfdfd]">
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="flex flex-col md:flex-row gap-6 lg:gap-8">
            {/* Desktop Filters Sidebar */}
            <aside className="hidden md:block w-64 lg:w-72 shrink-0">
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 sticky top-24">
                <FilterPanel />
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1">
              {/* Search and Sort Bar */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder={`Search ${type}...`}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-12 h-12 rounded-2xl border-gray-200 focus:border-primary focus:ring-primary"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[140px] h-12 rounded-2xl border-gray-200">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      <SelectItem value="created_at">Newest</SelectItem>
                      {type === "products" && <SelectItem value="current_price">Price</SelectItem>}
                      {type === "bundles" && <SelectItem value="bundle_price">Price</SelectItem>}
                      <SelectItem value="name">Name</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={sortOrder} onValueChange={setSortOrder}>
                    <SelectTrigger className="w-[100px] h-12 rounded-2xl border-gray-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      <SelectItem value="asc">Asc</SelectItem>
                      <SelectItem value="desc">Desc</SelectItem>
                    </SelectContent>
                  </Select>
                  {/* Mobile Filter Button - Only for products */}
                  {type === "products" && (
                    <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
                      <SheetTrigger asChild>
                        <Button variant="outline" className="md:hidden h-12 rounded-2xl border-gray-200">
                          <Filter className="w-5 h-5" />
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="left" className="rounded-r-3xl">
                        <SheetHeader>
                          <SheetTitle className="text-primary">Filters</SheetTitle>
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
              <p className="text-sm text-gray-600 mb-6">
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
                  <p className="text-gray-600 text-lg">No {type} found</p>
                  {type === "products" && (
                    <Button variant="link" onClick={clearFilters} className="mt-4 text-primary">
                      Clear filters
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {type === "brands" ? (
                      // Render Brands
                      allItems.map((brand: any) => (
                        <a key={brand.id} href={brand.website_url} target="_blank" rel="noopener noreferrer">
                          <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 h-full rounded-[24px] border-0">
                            <div className="relative aspect-square overflow-hidden bg-[#e0e5ce] flex items-center justify-center p-8">
                              <Image
                                src={brand.logo_url || "/placeholder.svg?height=200&width=200"}
                                alt={brand.name}
                                width={200}
                                height={200}
                                className="object-contain group-hover:scale-110 transition-transform duration-300"
                                loading="lazy"
                              />
                              {brand.is_featured && (
                                <Badge className="absolute top-4 right-4 bg-accent text-white rounded-full px-3 py-1">Featured</Badge>
                              )}
                            </div>
                            <CardContent className="p-5">
                              <h3 className="font-bold text-lg mb-2 text-primary">{brand.name}</h3>
                              <p className="text-sm text-gray-600 line-clamp-2">{brand.description}</p>
                            </CardContent>
                          </Card>
                        </a>
                      ))
                    ) : type === "bundles" ? (
                      // Render Bundles
                      allItems.map((bundle: any) => (
                        <Link key={bundle.id} href={`/product/bundle-${bundle.id}`}>
                          <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 h-full rounded-[24px] border-0">
                            <div className="relative aspect-square overflow-hidden bg-[#e0e5ce] p-4">
                              <div className="relative w-full h-full rounded-2xl overflow-hidden">
                                <Image
                                  src={bundle.image_url || "/placeholder.svg?height=300&width=300"}
                                  alt={bundle.name}
                                  fill
                                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                                  loading="lazy"
                                />
                              </div>
                              <Badge className="absolute top-6 left-6 bg-primary text-white rounded-full px-3 py-1">Bundle</Badge>
                              {bundle.original_price && bundle.original_price > bundle.bundle_price && (
                                <Badge variant="destructive" className="absolute top-6 right-6 rounded-full px-3 py-1">
                                  Save Rs. {(bundle.original_price - bundle.bundle_price).toLocaleString()}
                                </Badge>
                              )}
                            </div>
                            <CardContent className="p-5">
                              <h3 className="font-semibold text-base line-clamp-2 mb-2 text-gray-900">{bundle.name}</h3>
                              <p className="text-sm text-gray-600 line-clamp-1 mb-3">{bundle.description}</p>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-lg text-accent">
                                  Rs. {Number(bundle.bundle_price).toLocaleString()}
                                </span>
                                {bundle.original_price && bundle.original_price > bundle.bundle_price && (
                                  <span className="text-sm text-gray-500 line-through">
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

                          // Prefer API image, but always fall back to product fields so we never render blank
                          const imageUrl =
                            primaryImage?.image_url ||
                            product.thumbnail_url ||
                            product.image_url ||
                            "/placeholder.svg"
                          
                          // Calculate pricing tiers
                          const officialPrice = product.original_price || product.current_price
                          const sellingPrice = product.current_price
                          const discountedPrice = calculateDiscountedPrice(sellingPrice)
                          
                          return (
                            <Link key={product.id} href={`/product/${product.slug}`}>
                              <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 h-full rounded-[24px] border-0 bg-white">
                                <div className="relative aspect-square overflow-hidden bg-[#e0e5ce] p-4">
                                  <div className="relative w-full h-full rounded-2xl overflow-hidden">
                                    <OptimizedImage
                                      src={imageUrl}
                                      alt={product.name}
                                      width={300}
                                      height={300}
                                      className="group-hover:scale-110 transition-transform duration-300 w-full h-full object-cover"
                                      loading="lazy"
                                      onLoad={() => performanceMonitor.recordImageLoad(Date.now())}
                                      onError={() => {
                                        console.warn(`Image load error for product: ${product.name}`)
                                      }}
                                    />
                                    {/* Hover Overlay */}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2">
                                        <Button
                                          size="sm"
                                          variant="secondary"
                                          className="h-10 w-10 rounded-full bg-white hover:bg-white/90 shadow-lg"
                                          onClick={(e) => handleAddToWishlist(product.id, e)}
                                        >
                                          <Heart className="w-5 h-5 text-primary" />
                                        </Button>
                                        <Button
                                          size="sm"
                                          className="h-10 px-6 rounded-full bg-primary hover:bg-primary/90 text-white shadow-lg font-semibold"
                                          onClick={(e) => handleAddToCart(product.id, e)}
                                        >
                                          <ShoppingCart className="w-4 h-4 mr-2" />
                                          Add to Cart
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                  {product.is_new_arrival && (
                                    <Badge className="absolute top-6 left-6 bg-accent text-white rounded-full px-3 py-1 shadow-md">New</Badge>
                                  )}
                                  {activeDiscount && (
                                    <Badge variant="destructive" className="absolute top-6 right-6 rounded-full px-3 py-1 shadow-md">
                                      {activeDiscount.discount_type === "percentage"
                                        ? `${activeDiscount.discount_value}% OFF`
                                        : `Rs. ${activeDiscount.discount_value} OFF`}
                                    </Badge>
                                  )}
                                </div>
                                <CardContent className="p-5">
                                  <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">{product.category_name}</p>
                                  <h3 className="font-semibold text-base line-clamp-2 mb-3 text-gray-900 group-hover:text-primary transition-colors">{product.name}</h3>
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                      <span className="text-gray-500">Official Price</span>
                                      <span className="line-through text-gray-400">{formatPrice(officialPrice)}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                      <span className="text-gray-500">Selling Price</span>
                                      <span className="line-through text-gray-400">{formatPrice(sellingPrice)}</span>
                                    </div>
                                    <div className="flex items-center justify-between font-bold text-base pt-2 border-t border-gray-100">
                                      <span className="text-gray-700">Our Price</span>
                                      <span className="text-accent text-lg">{formatPrice(discountedPrice)}</span>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </Link>
                          )
                        })}
                        {/* Show skeleton loaders while loading more products */}
                        {itemsLoading && (
                          <>
                            {Array.from({ length: 3 }).map((_, i) => (
                              <ProductCardSkeleton key={`skeleton-${i}`} />
                            ))}
                          </>
                        )}
                      </>
                    )}
                  </div>
                  {hasMore && (
                    <div className="flex justify-center mt-12">
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
                        className="rounded-2xl px-8 h-12 bg-primary hover:bg-primary/90 text-white font-semibold shadow-md hover:shadow-lg transition-all"
                      >
                        {itemsLoading ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          <>
                            Load More Products
                          </>
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
