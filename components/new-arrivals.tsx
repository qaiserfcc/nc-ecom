"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, ShoppingCart, Loader2, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
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
  const [currentPage, setCurrentPage] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  const productsPerPage = isMobile ? 6 : 10

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, discountRes] = await Promise.all([
          fetch("/api/products?new=true&limit=50"),
          fetch("/api/discounts/active"),
        ])
        
        if (!productsRes.ok) throw new Error("Failed to fetch new arrivals")
        
        const productsData = await productsRes.json()
        const discountData = await discountRes.json()
        
        setProducts(productsData.products || [])
        setDiscount(discountData.discount || null)
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

  const totalPages = Math.ceil(products.length / productsPerPage)
  const displayedProducts = products.slice(
    currentPage * productsPerPage,
    (currentPage + 1) * productsPerPage
  )

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1))
  }

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))
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

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {displayedProducts.map((product, index) => {
            const delayClass = index < 8 ? `animation-delay-${(index + 1) * 100}` : '';
            const discountedPrice = calculateDiscountedPrice(product.current_price)
            return (
              <Card
                key={product.id}
                className={`overflow-hidden hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm border-border/70 group animate-fade-in ${delayClass}`}
              >
                <CardContent className="p-0">
                  <Link href={`/product/${product.slug}`}>
                    <div className="relative overflow-hidden bg-gradient-to-br from-secondary/25 via-white to-primary/15 h-40 sm:h-48">
                      <img
                        src={product.image_url || "/placeholder.svg"}
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
                  <div className="p-3 sm:p-4 space-y-2">
                    <Link href={`/product/${product.slug}`}>
                      <h3 className="font-semibold text-sm sm:text-base line-clamp-2 text-foreground hover:text-primary transition-colors">
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
                        className="flex-1 h-9 text-xs sm:text-sm transition-transform hover:scale-105"
                        disabled={pendingId === product.id}
                        onClick={() => handleAdd(product.id)}
                      >
                        {pendingId === product.id ? (
                          <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 animate-spin" />
                        ) : (
                          <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
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
                        <Heart className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevPage}
              disabled={currentPage === 0}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage + 1} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage === totalPages - 1}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        <Link href="/shop?new=true">
          <Button className="w-full sm:hidden mt-6">View All New Arrivals</Button>
        </Link>
      </div>
    </section>
  )
}
