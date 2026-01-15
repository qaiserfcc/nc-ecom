"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, ShoppingCart, Loader2, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/hooks/use-auth"
import { notify } from "@/lib/utils/notifications"

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

  const ITEMS_PER_PAGE = 12

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        const [productsRes, discountRes] = await Promise.all([
          fetch(`/api/products?new=true&limit=${ITEMS_PER_PAGE}&offset=0`),
          fetch("/api/discounts/active"),
        ])
        
        if (!productsRes.ok) throw new Error("Failed to fetch new arrivals")
        
        const productsData = await productsRes.json()
        setProducts(productsData.products || [])
        
        if (discountRes.ok) {
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

  const formatPrice = (value: number) => `Rs. ${Math.round(value).toLocaleString()}`

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
      <section className="py-8 sm:py-12 md:py-16 bg-[#fcfdfd]">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">New Arrivals</h2>
              <p className="text-gray-600 text-sm mt-2">Fresh products just added to our collection</p>
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
      <section className="py-8 sm:py-12 md:py-16 bg-[#fcfdfd]">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">New Arrivals</h2>
              <p className="text-gray-600 text-sm mt-2">Fresh products just added to our collection</p>
            </div>
          </div>
          <Card>
            <CardContent className="py-20 text-center">
              <p className="text-gray-600">{error || "No new products available"}</p>
            </CardContent>
          </Card>
        </div>
      </section>
    )
  }

  const displayedProducts = products.slice(0, ITEMS_PER_PAGE)

  return (
    <section className="py-8 sm:py-12 md:py-16 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">New Arrivals</h2>
            <p className="text-muted-foreground text-sm mt-2">
              Discover the latest and greatest products just added to our collection
            </p>
          </div>
          <Link href="/shop?new=true">
            <Button variant="outline" className="hidden sm:flex items-center gap-2 bg-white/50 hover:bg-white/80 border-primary/30 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
              View All <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 animate-fade-in">
          {displayedProducts.map((product) => {
            const officialPrice = product.original_price || product.current_price
            const sellingPrice = product.current_price
            const discountedPrice = calculateDiscountedPrice(sellingPrice)
            return (
              <Card
                key={product.id}
                className="overflow-hidden hover:shadow-2xl transition-all duration-500 bg-white/95 backdrop-blur-md border-border/50 group h-full flex flex-col hover:-translate-y-2"
              >
                <CardContent className="p-0 flex-1 flex flex-col">
                  <Link href={`/product/${product.id}`}>
                    <div className="relative overflow-hidden bg-gradient-to-br from-secondary/30 via-white/50 to-primary/20 sm:min-h-52 lg:min-h-64 flex items-center justify-center">
                      <div className="absolute inset-0 bg-grid-small opacity-5" />
                      <Image
                        src={product.image_url || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-contain group-hover:scale-125 group-hover:-rotate-1 transition-transform duration-500 ease-out"
                        loading="lazy"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <Badge className="absolute top-3 left-3 bg-gradient-to-r from-accent to-primary text-white font-semibold shadow-lg animate-pulse">New</Badge>
                    </div>
                  </Link>
                  <div className="p-3 sm:p-4 space-y-3 flex-1 flex flex-col">
                    <Link href={`/product/${product.id}`}>
                      <h3 className="font-semibold text-sm sm:text-base line-clamp-2 text-foreground hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    <div className="space-y-1 text-xs sm:text-sm">
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span>Official Price</span>
                        <span className="line-through">{formatPrice(officialPrice)}</span>
                      </div>
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span>Selling Price</span>
                        <span className="line-through">{formatPrice(sellingPrice)}</span>
                      </div>
                      <div className="flex items-center justify-between font-semibold text-primary">
                        <span>Our Discounted Price</span>
                        <span>{formatPrice(discountedPrice)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-auto">
                      <Button
                        size="sm"
                        className="flex-1 h-9 text-xs sm:text-sm bg-gradient-to-r from-accent to-primary hover:shadow-lg hover:from-accent/90 hover:to-primary/90 transition-all duration-300 transform hover:scale-105"
                        disabled={pendingId === product.id}
                        onClick={() => handleAdd(product.id)}
                      >
                        {pendingId === product.id ? (
                          <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 animate-spin" />
                        ) : (
                          <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        )}
                        Add to Cart
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 h-9 bg-white hover:bg-accent/10 border-accent/30 hover:border-accent/50 transition-all duration-300 transform hover:scale-105"
                        disabled={pendingId === product.id}
                        onClick={() => handleWishlist(product.id)}
                      >
                        <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-accent" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="flex justify-center mt-8 sm:hidden">
          <Link href="/shop?new=true" className="w-full">
            <Button variant="outline" className="w-full items-center gap-2 bg-transparent">
              View All <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
