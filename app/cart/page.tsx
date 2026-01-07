"use client"
/* eslint-disable @next/next/no-inline-styles */

import { useState } from "react"
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
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { data, isLoading, mutate } = useSWR(isAuthenticated ? "/api/cart" : null, fetcher)
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const [removingId, setRemovingId] = useState<number | null>(null)
  const [isClearing, setIsClearing] = useState(false)

  const items = data?.items || []
  const computedTotals = items.reduce(
    (acc: { original: number; selling: number }, item: any) => {
      const baseOriginal = Number(item.original_price) + (Number(item.price_modifier) || 0)
      const baseSelling = Number(item.current_price) + (Number(item.price_modifier) || 0)
      return {
        original: acc.original + baseOriginal * item.quantity,
        selling: acc.selling + baseSelling * item.quantity,
      }
    },
    { original: 0, selling: 0 },
  )

  const totalsData = data?.totals
  const originalTotal = totalsData?.original ?? computedTotals.original
  const sellingTotal = totalsData?.selling ?? computedTotals.selling
  const officialDiscount = totalsData?.officialDiscount ?? Math.max(0, originalTotal - sellingTotal)
  const officialDiscountPercent =
    totalsData?.officialDiscountPercent ?? (originalTotal > 0 ? Math.round((officialDiscount / originalTotal) * 100) : 0)
  const promoAmount = totalsData?.promoAmount ?? 0
  const promoPercent = totalsData?.promoPercent ?? 0
  const cumulativeDiscount = totalsData?.cumulativeDiscount ?? officialDiscount + promoAmount
  const cumulativeDiscountPercent =
    totalsData?.cumulativeDiscountPercent ?? (originalTotal > 0 ? Math.round((cumulativeDiscount / originalTotal) * 100) : 0)
  const finalAmount = totalsData?.final ?? Math.max(0, sellingTotal - promoAmount)
  const promotionLabel = totalsData?.promotion?.name || (promoAmount > 0 ? `Promotion ${promoPercent}%` : "No promotion active")

  const updateQuantity = async (itemId: number, quantity: number) => {
    if (quantity < 1) return

    setUpdatingId(itemId)
    const toastId = notify.loading("Updating quantity...")
    try {
      const response = await fetch("/api/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item_id: itemId, quantity }),
      })

      if (!response.ok) {
        throw new Error("Failed to update quantity")
      }

      mutate()
      notify.dismiss(toastId)
      notify.success("Quantity updated", `Item quantity set to ${quantity}`)
    } catch (error) {
      notify.dismiss(toastId)
      notify.error("Failed to update quantity", error instanceof Error ? error.message : "Please try again")
    } finally {
      setUpdatingId(null)
    }
  }

  const removeItem = async (itemId: number) => {
    setRemovingId(itemId)
    const toastId = notify.loading("Removing item from cart...")
    try {
      const response = await fetch(`/api/cart?id=${itemId}`, { method: "DELETE" })

      if (!response.ok) {
        throw new Error("Failed to remove item")
      }

      mutate()
      notify.dismiss(toastId)
      notify.success("Item removed", "Item has been removed from your cart")
    } catch (error) {
      notify.dismiss(toastId)
      notify.error("Failed to remove item", error instanceof Error ? error.message : "Please try again")
    } finally {
      setRemovingId(null)
    }
  }

  const clearCart = async () => {
    setIsClearing(true)
    const toastId = notify.loading("Clearing cart...")
    try {
      const response = await fetch("/api/cart", { method: "DELETE" })

      if (!response.ok) {
        throw new Error("Failed to clear cart")
      }

      mutate()
      notify.dismiss(toastId)
      notify.success("Cart cleared", "All items have been removed from your cart")
    } catch (error) {
      notify.dismiss(toastId)
      notify.error("Failed to clear cart", error instanceof Error ? error.message : "Please try again")
    } finally {
      setIsClearing(false)
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
      <main className="min-h-screen bg-[#fcfdfd]">
        <div className="container mx-auto px-4 py-8 sm:py-12">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900">Shopping Cart</h1>
            <p className="text-muted-foreground text-sm md:text-base">You have {data?.itemCount || 0} item{(data?.itemCount || 0) !== 1 ? 's' : ''} in your cart</p>
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
                {items.map((item: any) => {
                  const baseOriginal = Number(item.original_price) + (Number(item.price_modifier) || 0)
                  const baseSelling = Number(item.current_price) + (Number(item.price_modifier) || 0)
                  // Calculate per-item promotion discount proportionally
                  const itemSellingTotal = baseSelling * item.quantity
                  const itemPromoDiscount = sellingTotal > 0 ? (itemSellingTotal / sellingTotal) * promoAmount : 0
                  const baseDiscounted = baseSelling - (itemPromoDiscount / item.quantity)
                  const lineOriginal = baseOriginal * item.quantity
                  const lineSelling = baseSelling * item.quantity
                  const lineDiscounted = baseSelling * item.quantity - itemPromoDiscount
                  return (
                    <div key={item.id}>
                      <Card className="bg-white hover:shadow-xl transition-all duration-300 border-gray-100 rounded-3xl">
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-[#e0e5ce] shrink-0 group">
                              <Image
                                src={item.image_url || "/placeholder.svg?height=100&width=100"}
                                alt={item.name}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-300"
                                loading="lazy"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <Link href={`/product/${item.slug}`} className="hover:text-primary transition">
                                <h3 className="font-semibold line-clamp-2 text-base break-words">{item.name}</h3>
                              </Link>
                              {item.variant_name && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {item.variant_name}: {item.variant_value}
                                </p>
                              )}
                              <div className="space-y-1 mt-2 text-xs sm:text-sm">
                                <div className="flex items-center justify-between text-muted-foreground">
                                  <span>Official Price</span>
                                  <span className="line-through">Rs. {baseOriginal.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center justify-between text-muted-foreground">
                                  <span>Selling Price</span>
                                  <span className={promoAmount > 0 ? "line-through" : "font-semibold"}>Rs. {baseSelling.toLocaleString()}</span>
                                </div>
                                {promoAmount > 0 && (
                                  <div className="flex items-center justify-between text-primary font-semibold">
                                    <span>Our Discounted Price</span>
                                    <span>Rs. {baseDiscounted.toLocaleString()}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col items-end justify-between">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
                                onClick={() => removeItem(item.id)}
                                disabled={removingId === item.id || updatingId === item.id}
                              >
                                {removingId === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                              </Button>
                              <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 bg-transparent border-0 hover:bg-muted transition-colors"
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  disabled={item.quantity <= 1 || updatingId === item.id}
                                >
                                  {updatingId === item.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Minus className="w-3 h-3" />}
                                </Button>
                                <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 bg-transparent border-0 hover:bg-muted transition-colors"
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  disabled={item.quantity >= item.stock_quantity || updatingId === item.id}
                                >
                                  {updatingId === item.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
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
                  <Button variant="destructive" onClick={clearCart} className="opacity-80 hover:opacity-100 transition-opacity" disabled={isClearing}>
                    {isClearing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Clear Cart
                  </Button>
                </div>
              </div>

              {/* Order Summary */}
              <div>
                <div className="sticky top-24">
                  <Card className="bg-white border-gray-100 shadow-sm rounded-3xl">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-xl">Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3 bg-gray-50 rounded-2xl p-4 border border-gray-100">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground text-sm">Official Price ({data?.itemCount || 0} items)</span>
                          <span className="font-semibold">Rs. {originalTotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm border-t pt-2">
                          <span className="text-muted-foreground">Official Discount</span>
                          <span className="text-green-500 font-semibold">-{officialDiscountPercent}% (Rs. {officialDiscount.toLocaleString()})</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">After Official Discount</span>
                          <span className="font-semibold">Rs. {sellingTotal.toLocaleString()}</span>
                        </div>
                        {promoAmount > 0 && (
                          <>
                            <div className="flex justify-between items-center text-sm border-t pt-2">
                              <span className="text-muted-foreground">Our Active Discount</span>
                              <span className="text-green-500 font-semibold">-{promoPercent}% (Rs. {promoAmount.toLocaleString()})</span>
                            </div>
                            <div className="flex justify-between items-center text-sm text-primary font-semibold border-t pt-2">
                              <span>Cumulative Discount</span>
                              <span>{Math.min(100, cumulativeDiscountPercent)}% (Rs. {cumulativeDiscount.toLocaleString()})</span>
                            </div>
                          </>
                        )}
                      </div>

                      <div className="space-y-2 rounded-2xl p-4 bg-gray-50 border border-gray-100 text-sm text-gray-600">
                        <p className="text-sm font-semibold text-foreground">Savings Breakdown</p>
                        <p>Official Discount: <span className="font-bold text-green-600">{officialDiscountPercent}%</span></p>
                        {promoAmount > 0 && (
                          <>
                            <p>Our Active Discount: <span className="font-bold text-green-600">{promoPercent}%</span></p>
                            <p>Cumulative Discount: <span className="font-bold text-green-600">{Math.min(100, cumulativeDiscountPercent)}%</span></p>
                          </>
                        )}
                      </div>

                      <div className="border-t border-border/50 pt-3">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Shipping</span>
                          <span className="text-green-400 font-medium">Free</span>
                        </div>
                      </div>
                      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-4 border border-primary/20">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold">Final Payable</span>
                          <span className="text-2xl font-bold text-primary">Rs. {finalAmount.toLocaleString()}</span>
                        </div>
                        {promoAmount > 0 && <p className="text-xs text-muted-foreground mt-1">{promotionLabel}</p>}
                      </div>
                      <p className="text-xs text-muted-foreground text-center">Promotions calculated server-side to match checkout</p>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full bg-gradient-to-r from-primary to-primary/80 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 py-6 text-base font-semibold rounded-2xl" asChild>
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
