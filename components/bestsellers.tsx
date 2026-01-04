"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, ShoppingCart, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { useAuth } from "@/lib/hooks/use-auth"
import { notify } from "@/lib/utils/notifications"
import { cacheService } from "@/lib/cache-service"

interface Product {
  id: number
  name: string
  slug: string
  current_price: number
  original_price: number
  image_url: string
  stock_quantity: number
}

interface Discount {
  id: number
  discount_type: string
  discount_value: number
}

export default function Bestsellers() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pendingId, setPendingId] = useState<number | null>(null)
  const [discount, setDiscount] = useState<Discount | null>(null)
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)

  const ITEMS_PER_PAGE = 12

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        
        // Check cache first
        const cacheKey = `/api/products?featured=true&limit=${ITEMS_PER_PAGE}&offset=${offset}`
        let productsData = cacheService.get(cacheKey)
        
        if (!productsData) {
          const productsRes = await fetch(cacheKey)
          if (!productsRes.ok) {
            throw new Error("Failed to fetch products")
          }
          productsData = await productsRes.json()
          cacheService.set(cacheKey, productsData, 5 * 60 * 1000) // 5 min cache
        }
        
        if (offset === 0) {
          setProducts(productsData.products || [])
        } else {
          setProducts(prev => [...prev, ...(productsData.products || [])])
          setLoadingMore(false)
        }
        
        setHasMore(productsData.pagination?.hasMore || false)
        
        // Handle discount fetch separately
        if (offset === 0) {
          const discountRes = await fetch("/api/discounts/active")
          if (discountRes.ok) {
            const discountData = await discountRes.json()
            setDiscount(discountData.discount || null)
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to load products")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [offset])

  const calculateDiscount = (original: number, current: number) => {
    if (!original) return 0
    return Math.max(0, Math.round(((original - current) / original) * 100))
  }

  const calculateDiscountedPrice = (price: number) => {
    if (!discount) return price
    
    if (discount.discount_type === "percentage") {
      return price - (price * discount.discount_value) / 100
    } else {
      return Math.max(0, price - discount.discount_value)
    }
  }

  const handleAdd = async (productId: number) => {
    if (!isAuthenticated) {
      notify.warning("Please sign in", "You need to be logged in to add items to cart")
      router.push("/signin")
      return
    }
    
    setPendingId(productId)
    const toastId = notify.loading("Adding to cart...")
    
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId, quantity: 1 }),
      })
      
      if (!response.ok) {
        throw new Error("Failed to add to cart")
      }
      
      notify.dismiss(toastId)
      notify.success("Added to cart!", "View your cart now")
      setTimeout(() => router.push("/cart"), 1500)
    } catch (error) {
      notify.dismiss(toastId)
      notify.error("Failed to add to cart", error instanceof Error ? error.message : "Please try again")
    } finally {
      setPendingId(null)
    }
  }

  const handleWishlist = async (productId: number) => {
    if (!isAuthenticated) {
      notify.warning("Please sign in", "You need to be logged in to add items to wishlist")
      router.push("/signin")
      return
    }
    
    setPendingId(productId)
    const toastId = notify.loading("Adding to wishlist...")
    
    try {
      const response = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId }),
      })
      
      if (!response.ok) {
        throw new Error("Failed to add to wishlist")
      }
      
      notify.dismiss(toastId)
      notify.success("Added to wishlist!", "Check your wishlist anytime")
    } catch (error) {
      notify.dismiss(toastId)
      notify.error("Failed to add to wishlist", error instanceof Error ? error.message : "Please try again")
    } finally {
      setPendingId(null)
    }
  }

  if (loading) {
    return (
      <section className="py-8 sm:py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2 text-foreground">Best Sellers</h2>
          <p className="text-center text-muted-foreground mb-8 sm:mb-12">
            Our most loved products by thousands of customers
          </p>
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
      </section>
    )
  }

  if (error || products.length === 0) {
    return (
      <section className="py-8 sm:py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2 text-foreground">Best Sellers</h2>
          <p className="text-center text-muted-foreground mb-8 sm:mb-12">
            Our most loved products by thousands of customers
          </p>
          <Card>
            <CardContent className="py-20 text-center">
              <p className="text-muted-foreground">{error || "No products available"}</p>
            </CardContent>
          </Card>
        </div>
      </section>
    )
  }

  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE)
  const displayedProducts = products.slice(
    offset,
    offset + ITEMS_PER_PAGE
  )

  const handleLoadMore = () => {
    setLoadingMore(true)
    setOffset(offset + ITEMS_PER_PAGE)
  }

  return (
    <section className="py-8 sm:py-12 md:py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2 text-foreground">Best Sellers</h2>
        <p className="text-center text-muted-foreground mb-8 sm:mb-12">
          Our most loved products by thousands of customers
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {displayedProducts.map((product) => {
            const discountedPrice = calculateDiscountedPrice(product.current_price)
            return (
              <Card
                key={product.id}
                className="overflow-hidden hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm border-border/70 group"
              >
                <CardContent className="p-0">
                  <Link href={`/product/${product.slug}`}>
                    <div className="relative overflow-hidden bg-gradient-to-br from-secondary/20 via-white to-primary/10 h-40 sm:h-48">
                      <img
                        src={product.image_url || "/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-transparent" />
                      {discount && (
                        <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground">
                          {discount.discount_type === "percentage"
                            ? `${discount.discount_value}% OFF`
                            : `Rs. ${discount.discount_value} OFF`}
                        </Badge>
                      )}
                    </div>
                  </Link>
                  <div className="p-3 sm:p-4 space-y-2">
                    <Link href={`/product/${product.slug}`}>
                      <h3 className="font-semibold text-sm sm:text-base line-clamp-2 text-foreground hover:text-primary">
                        {product.name}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-2">
                      {discount ? (
                        <>
                          <span className="text-muted-foreground line-through text-xs sm:text-sm">
                            Rs. {product.current_price.toLocaleString()}
                          </span>
                          <span className="text-primary font-bold text-sm sm:text-base">
                            Rs. {Math.round(discountedPrice).toLocaleString()}
                          </span>
                        </>
                      ) : (
                        <span className="text-primary font-bold text-sm sm:text-base">
                          Rs. {product.current_price.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 h-9 text-xs sm:text-sm"
                        disabled={pendingId === product.id || product.stock_quantity === 0}
                        onClick={() => handleAdd(product.id)}
                      >
                        {pendingId === product.id ? (
                          <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 animate-spin" />
                        ) : (
                          <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        )}
                        {product.stock_quantity === 0 ? "Out" : "Add"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 h-9 bg-transparent"
                        disabled={pendingId === product.id}
                        onClick={() => handleWishlist(product.id)}
                      >
                        <Heart className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {hasMore && (
          <div className="flex justify-center mt-8">
            <Button
              onClick={handleLoadMore}
              disabled={loadingMore}
              size="lg"
            >
              {loadingMore ? (
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
      </div>
    </section>
  )
}
