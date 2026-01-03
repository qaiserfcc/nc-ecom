"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, ShoppingCart, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/hooks/use-auth"
import { notify } from "@/lib/utils/notifications"

interface Product {
  id: number
  name: string
  slug: string
  current_price: number
  original_price: number
  image_url: string
  stock_quantity: number
}

export default function Bestsellers() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pendingId, setPendingId] = useState<number | null>(null)

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true)
        const response = await fetch("/api/products?featured=true&limit=100")
        if (!response.ok) {
          throw new Error("Failed to fetch products")
        }
        const data = await response.json()
        setProducts(data.products || [])
      } catch (err) {
        console.error("Error fetching products:", err)
        setError("Failed to load products")
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const calculateDiscount = (original: number, current: number) => {
    if (!original) return 0
    return Math.max(0, Math.round(((original - current) / original) * 100))
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

  return (
    <section className="py-8 sm:py-12 md:py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2 text-foreground">Best Sellers</h2>
        <p className="text-center text-muted-foreground mb-8 sm:mb-12">
          Our most loved products by thousands of customers
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {products.map((product) => {
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
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-transparent" />
                    </div>
                  </Link>
                  <div className="p-3 sm:p-4 space-y-2">
                    <Link href={`/product/${product.slug}`}>
                      <h3 className="font-semibold text-sm sm:text-base line-clamp-2 text-foreground hover:text-primary">
                        {product.name}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-2">
                      <span className="text-primary font-bold text-sm sm:text-base">
                        Rs. {product.current_price.toLocaleString()}
                      </span>
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
      </div>
    </section>
  )
}
