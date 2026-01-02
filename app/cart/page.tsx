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
import { Minus, Plus, Trash2, Loader2, ShoppingBag } from "lucide-react"
import { useAuth } from "@/lib/hooks/use-auth"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function CartPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { data, isLoading, mutate } = useSWR(isAuthenticated ? "/api/cart" : null, fetcher)

  const items = data?.items || []
  const subtotal = data?.subtotal || 0

  const updateQuantity = async (itemId: number, quantity: number) => {
    await fetch("/api/cart", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ item_id: itemId, quantity }),
    })
    mutate()
  }

  const removeItem = async (itemId: number) => {
    await fetch(`/api/cart?id=${itemId}`, { method: "DELETE" })
    mutate()
  }

  const clearCart = async () => {
    await fetch("/api/cart", { method: "DELETE" })
    mutate()
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
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-6">Shopping Cart</h1>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20">
              <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-6">Add some products to get started</p>
              <Button asChild>
                <Link href="/shop">Continue Shopping</Link>
              </Button>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item: any) => {
                  const itemPrice = Number(item.current_price) + (Number(item.price_modifier) || 0)
                  return (
                    <Card key={item.id}>
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <div className="relative w-24 h-24 rounded-md overflow-hidden bg-muted shrink-0">
                            <Image
                              src={item.image_url || "/placeholder.svg?height=100&width=100"}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <Link href={`/product/${item.slug}`} className="hover:text-primary">
                              <h3 className="font-medium line-clamp-2">{item.name}</h3>
                            </Link>
                            {item.variant_name && (
                              <p className="text-sm text-muted-foreground">
                                {item.variant_name}: {item.variant_value}
                              </p>
                            )}
                            <p className="font-bold text-primary mt-1">Rs. {itemPrice.toLocaleString()}</p>
                          </div>
                          <div className="flex flex-col items-end justify-between">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => removeItem(item.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 bg-transparent"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="w-8 text-center text-sm">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 bg-transparent"
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
                  )
                })}
                <div className="flex justify-between">
                  <Button variant="outline" asChild>
                    <Link href="/shop">Continue Shopping</Link>
                  </Button>
                  <Button variant="destructive" onClick={clearCart}>
                    Clear Cart
                  </Button>
                </div>
              </div>

              {/* Order Summary */}
              <div>
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal ({data?.itemCount} items)</span>
                      <span>Rs. {subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="text-green-600">Free</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-primary">Rs. {subtotal.toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Discounts will be applied automatically at checkout</p>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" size="lg" asChild>
                      <Link href="/checkout">Proceed to Checkout</Link>
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
