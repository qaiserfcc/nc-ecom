"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import useSWR from "swr"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Minus, Plus, Trash2, Loader2, ShoppingBag } from "lucide-react"
import { useAuth } from "@/lib/hooks/use-auth"
import { notify } from "@/lib/utils/notifications"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function CartPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { data, isLoading, mutate } = useSWR(isAuthenticated ? "/api/cart" : null, fetcher)

  const items = data?.items || []
  const subtotal = data?.subtotal || 0
  const totals = items.reduce(
    (acc: { original: number; final: number }, item: any) => {
      const baseOriginal = Number(item.original_price) + (Number(item.price_modifier) || 0)
      const baseFinal = Number(item.current_price) + (Number(item.price_modifier) || 0)
      return {
        original: acc.original + baseOriginal * item.quantity,
        final: acc.final + baseFinal * item.quantity,
      }
    },
    { original: 0, final: 0 },
  )
  const totalDiscount = Math.max(0, totals.original - totals.final)
  const totalDiscountPercent = totals.original > 0 ? Math.round((totalDiscount / totals.original) * 100) : 0

  const updateQuantity = async (itemId: number, quantity: number) => {
    try {
      await fetch("/api/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item_id: itemId, quantity }),
      })
      mutate()
      notify.success("Quantity updated")
    } catch (error) {
      notify.error("Failed to update quantity")
    }
  }

  const removeItem = async (itemId: number) => {
    try {
      await fetch(`/api/cart?id=${itemId}`, { method: "DELETE" })
      mutate()
      notify.success("Item removed from cart")
    } catch (error) {
      notify.error("Failed to remove item")
    }
  }

  const clearCart = async () => {
    try {
      await fetch("/api/cart", { method: "DELETE" })
      mutate()
      notify.success("Cart cleared")
    } catch (error) {
      notify.error("Failed to clear cart")
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
        <div className="min-h-screen flex flex-col items-center justify-center px-4">
          <ShoppingBag className="w-16 h-16 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Sign in to view your cart</h1>
          <p className="text-muted-foreground mb-6">Please sign in to access your shopping cart</p>
          <Button asChild>
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
      <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8 animate-fade-in">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Shopping Cart</h1>
            <p className="text-muted-foreground">You have {data?.itemCount || 0} item{(data?.itemCount || 0) !== 1 ? 's' : ''} in your cart</p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20">
              <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4 animate-bounce" />
              <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-6">Add some products to get started</p>
              <Button asChild size="lg">
                <Link href="/shop">Continue Shopping</Link>
              </Button>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item: any, index: number) => {
                  const baseOriginal = Number(item.original_price) + (Number(item.price_modifier) || 0)
                  const baseFinal = Number(item.current_price) + (Number(item.price_modifier) || 0)
                  const lineOriginal = baseOriginal * item.quantity
                  const lineFinal = baseFinal * item.quantity
                  const lineDiscountPercent = baseOriginal > 0 ? Math.round(((baseOriginal - baseFinal) / baseOriginal) * 100) : 0
                  return (
                    <div key={item.id} className={`animate-fade-in`} style={{ animationDelay: `${index * 50}ms` }}>
                      <Card className="bg-gradient-to-br from-white/95 to-white/85 backdrop-blur-sm hover:shadow-lg transition-all duration-300 border-border/50">
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gradient-to-br from-muted to-muted/50 shrink-0 group">
                              <Image
                                src={item.image_url || "/placeholder.svg?height=100&width=100"}
                                alt={item.name}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <Link href={`/product/${item.slug}`} className="hover:text-primary transition">
                                <h3 className="font-medium line-clamp-2 text-base">{item.name}</h3>
                              </Link>
                              {item.variant_name && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {item.variant_name}: {item.variant_value}
                                </p>
                              )}
                              <div className="flex items-center gap-2 mt-2">
                                <span className="font-bold text-primary text-lg">Rs. {lineFinal.toLocaleString()}</span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end justify-between">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
                                onClick={() => removeItem(item.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                              <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 bg-transparent border-0 hover:bg-muted transition-colors"
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                >
                                  <Minus className="w-3 h-3" />
                                </Button>
                                <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 bg-transparent border-0 hover:bg-muted transition-colors"
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  disabled={item.quantity >= item.stock_quantity}
                                >
                                  <Plus className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )
                })}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button variant="outline" asChild className="hover:bg-muted transition-colors">
                    <Link href="/shop">← Continue Shopping</Link>
                  </Button>
                  <Button variant="destructive" onClick={clearCart} className="opacity-80 hover:opacity-100 transition-opacity">
                    Clear Cart
                  </Button>
                </div>
              </div>

              {/* Order Summary */}
              <div>
                <div className="sticky top-24 animate-fade-in" style={{ animationDelay: '150ms' }}>
                  <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 shadow-lg">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-xl">Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3 bg-white/50 rounded-lg p-3">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground text-sm">Subtotal ({data?.itemCount || 0} items)</span>
                          <span className="font-semibold">Rs. {totals.original.toLocaleString()}</span>
                        </div>
                        {totalDiscount > 0 && (
                          <div className="flex justify-between items-center text-green-600">
                            <span className="text-sm font-medium">Discount Applied</span>
                            <span className="font-bold">-Rs. {totalDiscount.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center text-green-600 text-sm">
                          <span>Savings</span>
                          <span className="font-bold">{totalDiscountPercent}%</span>
                        </div>
                      </div>
                      <div className="border-t border-border/50 pt-3">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Shipping</span>
                          <span className="text-green-600 font-medium">Free</span>
                        </div>
                      </div>
                      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-3 border border-primary/20">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold">Total Amount</span>
                          <span className="text-2xl font-bold text-primary">Rs. {totals.final.toLocaleString()}</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground text-center">Runtime promos applied automatically</p>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg transition-all duration-300 py-6 text-base font-semibold" asChild>
                        <Link href="/checkout">Proceed to Checkout →</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
