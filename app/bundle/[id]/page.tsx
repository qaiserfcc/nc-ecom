"use client"

import { useState, use } from "react"
import Link from "next/link"
import useSWR from "swr"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, ChevronLeft, ShoppingCart, Heart } from "lucide-react"
import { useAuth } from "@/lib/hooks/use-auth"
import { useRouter } from "next/navigation"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function BundlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [quantity, setQuantity] = useState(1)
  const [addingToCart, setAddingToCart] = useState(false)

  const { data, isLoading, error } = useSWR(`/api/bundles/${id}`, fetcher)
  const bundle = data?.bundle

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      router.push("/signin")
      return
    }

    setAddingToCart(true)
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bundle_id: bundle.id,
          quantity,
        }),
      })

      if (response.ok) {
        router.push("/cart")
      }
    } catch (error) {
      console.error("Failed to add to cart:", error)
    } finally {
      setAddingToCart(false)
    }
  }

  const handleAddToWishlist = async () => {
    if (!isAuthenticated) {
      router.push("/signin")
      return
    }

    try {
      await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bundle_id: bundle.id }),
      })
    } catch (error) {
      console.error("Failed to add to wishlist:", error)
    }
  }

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <Footer />
      </>
    )
  }

  if (error || !bundle) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex flex-col items-center justify-center">
          <p className="text-muted-foreground mb-4">Bundle not found</p>
          <Button asChild>
            <Link href="/shop">Back to Shop</Link>
          </Button>
        </div>
        <Footer />
      </>
    )
  }

  const items = bundle.items || []
  const bundlePrice = bundle.bundle_price || 0
  const originalPrice = bundle.original_price || 0
  const savings = originalPrice - bundlePrice
  const savingsPercent = originalPrice > 0 ? Math.round((savings / originalPrice) * 100) : 0

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-primary">
              Home
            </Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-primary">
              Shop
            </Link>
            <span>/</span>
            <span className="text-foreground">Bundles</span>
            <span>/</span>
            <span className="text-foreground">{bundle.name}</span>
          </nav>

          <Button variant="ghost" size="sm" className="mb-4" onClick={() => router.back()}>
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* Bundle Image */}
            <div className="space-y-4">
              <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                <img
                  src={bundle.image_url || "/placeholder.svg"}
                  alt={bundle.name}
                  className="w-full h-full object-cover"
                />
                {savingsPercent > 0 && (
                  <Badge variant="destructive" className="absolute top-4 right-4">
                    Save {savingsPercent}%
                  </Badge>
                )}
              </div>
            </div>

            {/* Bundle Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-balance mb-2">{bundle.name}</h1>
                <p className="text-muted-foreground">{bundle.description}</p>
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-primary">Rs. {bundlePrice.toLocaleString()}</span>
                {originalPrice > bundlePrice && (
                  <>
                    <span className="text-xl text-muted-foreground line-through">
                      Rs. {originalPrice.toLocaleString()}
                    </span>
                    <Badge className="bg-green-100 text-green-800">
                      Save Rs. {savings.toLocaleString()}
                    </Badge>
                  </>
                )}
              </div>

              {/* Bundle Items */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">What&apos;s Included</h3>
                <div className="space-y-3">
                  {items.map((item: any) => (
                    <Card key={item.id}>
                      <CardContent className="p-4 flex items-start gap-4">
                        <img
                          src={item.product_image || "/placeholder.svg"}
                          alt={item.product_name}
                          className="w-20 h-20 rounded object-cover"
                        />
                        <div className="flex-1">
                          <Link href={`/product/${item.product_id}`}>
                            <h4 className="font-semibold hover:text-primary">
                              {item.product_name} {item.quantity > 1 ? `x${item.quantity}` : ""}
                            </h4>
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            Rs. {(item.product_price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="text-sm font-medium mb-2 block">Quantity</label>
                <div className="flex items-center gap-3 w-fit">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </Button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </Button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  className="flex-1"
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {addingToCart ? "Adding..." : "Add to Cart"}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleAddToWishlist}
                >
                  <Heart className="w-4 h-4" />
                </Button>
              </div>

              {/* Benefits */}
              <Card>
                <CardContent className="pt-6 space-y-2">
                  <p className="text-sm">
                    <span className="font-semibold">✓</span> Free delivery on orders above Rs. 5000
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">✓</span> 14-day money-back guarantee
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">✓</span> Authentic products from trusted brands
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
