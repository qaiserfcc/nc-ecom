"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import useEmblaCarousel from "embla-carousel-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, ShoppingCart, Loader2, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/hooks/use-auth"
import { notify } from "@/lib/utils/notifications"

// Dynamically import Autoplay to avoid build errors if package is missing
let Autoplay: any = null
try {
  Autoplay = require("embla-carousel-autoplay").default
} catch (e) {
  console.warn("embla-carousel-autoplay not available, carousel will not auto-play")
}

interface Product {
  id: number
  name: string
  slug: string
  current_price: number
  original_price: number
  image_url: string
  thumbnail_url?: string
}

interface Discount {
  id: number
  discount_type: string
  discount_value: number
}

export default function NewArrivals() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pendingId, setPendingId] = useState<number | null>(null)
  const [discount, setDiscount] = useState<Discount | null>(null)

  // Carousel setup with autoplay (if available)
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true,
      align: 'start',
      slidesToScroll: 1,
    },
    Autoplay ? [Autoplay({ delay: 3000, stopOnInteraction: false })] : []
  )

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        const [productsRes, discountRes] = await Promise.all([
          fetch(`/api/products?new=true&limit=20`),
          fetch("/api/discounts/active"),
        ])
        
        if (!productsRes.ok) throw new Error("Failed to fetch new arrivals")
        
        const productsData = await productsRes.json()
        setProducts(productsData.products || [])
        
        // Handle discount fetch separately to avoid breaking if it fails
        if (discountRes && discountRes.ok) {
          const discountData = await discountRes.json()
          setDiscount(discountData.discount || null)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load products")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const calculateDiscount = (original: number, current: number): number => {
    if (original <= 0) return 0
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
      router.push("/signin")
      return
    }
    setPendingId(productId)
    try {
      await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId, quantity: 1 }),
      })
      notify.success("Added to cart")
      router.push("/cart")
    } catch (error) {
      notify.error("Failed to add to cart")
    } finally {
      setPendingId(null)
    }
  }

  const handleWishlist = async (productId: number) => {
    if (!isAuthenticated) {
      router.push("/signin")
      return
    }
    setPendingId(productId)
    try {
      await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId }),
      })
      notify.success("Added to wishlist")
    } catch (error) {
      notify.error("Failed to add to wishlist")
    } finally {
      setPendingId(null)
    }
  }
  
  if (loading) {
    return (
      <section className="py-8 sm:py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">New Arrivals</h2>
              <p className="text-muted-foreground text-sm mt-2">Fresh products just added to our collection</p>
            </div>
          </div>
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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">New Arrivals</h2>
              <p className="text-muted-foreground text-sm mt-2">Fresh products just added to our collection</p>
            </div>
          </div>
          <Card>
            <CardContent className="py-20 text-center">
              <p className="text-muted-foreground">{error || "No new products available"}</p>
            </CardContent>
          </Card>
        </div>
      </section>
    )
  }

  return (
    <section className="py-8 sm:py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">New Arrivals</h2>
            <p className="text-muted-foreground text-sm mt-2">Fresh products just added to our collection</p>
          </div>
          <Link href="/shop?new=true">
            <Button variant="outline" className="hidden sm:flex items-center gap-2 bg-transparent">
              View All <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Single horizontal carousel */}
        <div className="relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-4">
              {products.map((product) => {
                const discountedPrice = calculateDiscountedPrice(product.current_price)
                return (
                  <div key={product.id} className="flex-[0_0_280px] min-w-0">
                    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm border-border/70 group h-full">
                      <CardContent className="p-0">
                        <Link href={`/product/${product.slug}`}>
                          <div className="relative overflow-hidden bg-gradient-to-br from-secondary/25 via-white to-primary/15 h-48">
                            <img
                              src={product.thumbnail_url || product.image_url || "/placeholder.svg"}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
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
                        <div className="p-4 space-y-2">
                          <Link href={`/product/${product.slug}`}>
                            <h3 className="font-semibold text-base line-clamp-2 text-foreground hover:text-primary transition-colors">
                              {product.name}
                            </h3>
                          </Link>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <div className="flex flex-col">
                                <span className="text-[10px] text-muted-foreground/70">Official</span>
                                <span className="text-muted-foreground line-through text-xs">
                                  Rs. {product.original_price.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[10px] text-muted-foreground/70">Selling</span>
                                <span className="text-muted-foreground line-through text-sm">
                                  Rs. {product.current_price.toLocaleString()}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className="text-[10px] font-semibold text-primary/80">Our Price</span>
                              <div className="flex items-center gap-2">
                                <span className="text-primary font-bold text-base">
                                  Rs. {Math.round(discountedPrice).toLocaleString()}
                                </span>
                                {discount && (
                                  <Badge variant="secondary" className="text-xs">
                                    {discount.discount_type === "percentage"
                                      ? `${discount.discount_value}% OFF`
                                      : `Rs. ${discount.discount_value} OFF`}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="flex-1 h-9 text-sm transition-transform hover:scale-105"
                              disabled={pendingId === product.id}
                              onClick={() => handleAdd(product.id)}
                            >
                              {pendingId === product.id ? (
                                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                              ) : (
                                <ShoppingCart className="w-4 h-4 mr-1" />
                              )}
                              Add
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 h-9 bg-transparent transition-transform hover:scale-105"
                              disabled={pendingId === product.id}
                              onClick={() => handleWishlist(product.id)}
                            >
                              <Heart className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )
              })}
            </div>
          </div>
          
          {/* Carousel Navigation */}
          {products.length > 0 && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white/90 hover:bg-white shadow-lg z-10"
                onClick={scrollPrev}
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white/90 hover:bg-white shadow-lg z-10"
                onClick={scrollNext}
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </>
          )}
        </div>

        <Link href="/shop?new=true">
          <Button className="w-full sm:hidden mt-6">View All New Arrivals</Button>
        </Link>
      </div>
    </section>
  )
}
