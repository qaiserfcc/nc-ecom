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
    const toastId = notify.loading("Removing from wishlist...")
    try {
      const response = await fetch(`/api/wishlist?product_id=${productId}`, { method: "DELETE" })
      
      if (!response.ok) {
        throw new Error("Failed to remove from wishlist")
      }
      
      mutate()
      notify.dismiss(toastId)
      notify.success("Removed from wishlist", "Item has been removed from your wishlist")
    } catch (error) {
      notify.dismiss(toastId)
      notify.error("Failed to remove from wishlist", error instanceof Error ? error.message : "Please try again")
    }
  }

  const addToCart = async (productId: number) => {
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
      
      await removeFromWishlist(productId)
      notify.dismiss(toastId)
      notify.success("Added to cart!", "Redirecting to your cart...")
      setTimeout(() => router.push("/cart"), 1500)
    } catch (error) {
      notify.dismiss(toastId)
      notify.error("Failed to add to cart", error instanceof Error ? error.message : "Please try again")
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
        <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-[#fcfdfd]">
          <div className="w-20 h-20 mb-6 rounded-full bg-[#e0e5ce] flex items-center justify-center">
            <Heart className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2 text-gray-900">Sign in to view your wishlist</h1>
          <p className="text-gray-600 mb-6">Please sign in to access your saved items</p>
          <Button asChild className="rounded-2xl hover:shadow-xl hover:-translate-y-0.5 transition-all">
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
      <main className="min-h-screen bg-[#fcfdfd] py-8 sm:py-12">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Wishlist</h1>
            <p className="text-gray-600 mt-2">Your saved items and favorites</p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : items.length === 0 ? (
            <Card className="bg-white border-gray-100 rounded-3xl shadow-sm">
              <div className="text-center py-20">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#e0e5ce] flex items-center justify-center">
                  <Heart className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-xl font-semibold mb-2 text-gray-900">Your wishlist is empty</h2>
                <p className="text-gray-600 mb-6">Save items you love for later</p>
                <Button asChild className="rounded-2xl hover:shadow-xl hover:-translate-y-0.5 transition-all">
                  <Link href="/shop">Start Shopping</Link>
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {items.map((item: any) => (
                <Card key={item.id} className="group overflow-hidden bg-white border-gray-100 rounded-3xl hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
                  <Link href={`/product/${item.slug}`}>
                    <div className="relative aspect-square overflow-hidden bg-[#e0e5ce]">
                      <Image
                        src={item.image_url || "/placeholder.svg?height=300&width=300"}
                        alt={item.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-all duration-300"
                        loading="lazy"
                      />
                      {item.stock_quantity === 0 && (
                        <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                          <span className="text-sm font-medium">Out of Stock</span>
                        </div>
                      )}
                    </div>
                  </Link>
                  <CardContent className="p-3 bg-white">
                    <p className="text-xs text-gray-600 mb-1">{item.category_name}</p>
                    <h3 className="font-medium text-sm line-clamp-2 mb-2 text-gray-900">{item.name}</h3>
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
                        className="flex-1 rounded-xl hover:shadow-md transition-all"
                        onClick={() => addToCart(item.product_id)}
                        disabled={item.stock_quantity === 0}
                      >
                        <ShoppingCart className="w-4 h-4 mr-1" />
                        Add
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 bg-white border-gray-200 rounded-xl"
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
