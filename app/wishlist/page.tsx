"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import useSWR from "swr"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trash2, ShoppingCart, Loader2, Heart } from "lucide-react"
import { useAuth } from "@/lib/hooks/use-auth"
import { notify } from "@/lib/utils/notifications"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function WishlistPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { data, isLoading, mutate } = useSWR(isAuthenticated ? "/api/wishlist" : null, fetcher)

  const items = data?.items || []

  const removeFromWishlist = async (productId: number) => {
    try {
      await fetch(`/api/wishlist?product_id=${productId}`, { method: "DELETE" })
      mutate()
      notify.success("Removed from wishlist")
    } catch (error) {
      notify.error("Failed to remove from wishlist")
    }
  }

  const addToCart = async (productId: number) => {
    try {
      await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId, quantity: 1 }),
      })
      await removeFromWishlist(productId)
      notify.success("Added to cart")
      router.push("/cart")
    } catch (error) {
      notify.error("Failed to add to cart")
    }
  }

  if (authLoading) {
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

  if (!isAuthenticated) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-br from-accent via-background to-secondary/10">
          <div className="w-20 h-20 mb-6 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
            <Heart className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2 text-foreground">Sign in to view your wishlist</h1>
          <p className="text-muted-foreground mb-6">Please sign in to access your saved items</p>
          <Button asChild className="bg-gradient-to-r from-primary to-secondary hover:shadow-lg transition-all">
            <Link href="/signin">Sign In</Link>
          </Button>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-accent via-background to-secondary/10">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent">My Wishlist</h1>
            <p className="text-muted-foreground mt-2">Your saved items and favorites</p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : items.length === 0 ? (
            <Card className="bg-white/90 backdrop-blur-sm border-primary/20 shadow-lg">
              <div className="text-center py-20">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <Heart className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-xl font-semibold mb-2 text-foreground">Your wishlist is empty</h2>
                <p className="text-muted-foreground mb-6">Save items you love for later</p>
                <Button asChild className="bg-gradient-to-r from-primary to-secondary hover:shadow-lg transition-all">
                  <Link href="/shop">Start Shopping</Link>
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {items.map((item: any) => (
                <Card key={item.id} className="group overflow-hidden bg-white/90 backdrop-blur-sm border-primary/20 hover:border-primary/40 hover:shadow-xl transition-all duration-300">
                  <Link href={`/product/${item.slug}`}>
                    <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-accent to-secondary/10">
                      <Image
                        src={item.image_url || "/placeholder.svg?height=300&width=300"}
                        alt={item.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {item.stock_quantity === 0 && (
                        <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                          <span className="text-sm font-medium">Out of Stock</span>
                        </div>
                      )}
                    </div>
                  </Link>
                  <CardContent className="p-3 bg-gradient-to-b from-accent/30 to-white">
                    <p className="text-xs text-muted-foreground mb-1">{item.category_name}</p>
                    <h3 className="font-medium text-sm line-clamp-2 mb-2 text-foreground">{item.name}</h3>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-bold text-primary">Rs. {Number(item.current_price).toLocaleString()}</span>
                      <span className="text-xs text-muted-foreground line-through">
                        Rs. {Number(item.original_price).toLocaleString()}
                      </span>
                      <Badge variant="secondary" className="text-[11px] px-2 py-0 bg-gradient-to-r from-secondary/80 to-secondary">
                        {Math.max(0, Math.round(((Number(item.original_price) - Number(item.current_price)) / Number(item.original_price)) * 100))}%
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:shadow-md transition-all"
                        onClick={() => addToCart(item.product_id)}
                        disabled={item.stock_quantity === 0}
                      >
                        <ShoppingCart className="w-4 h-4 mr-1" />
                        Add
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 bg-white border-destructive/30"
                        onClick={() => removeFromWishlist(item.product_id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
