"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import useSWR from "swr"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, CreditCard, Banknote, ShoppingBag, CheckCircle } from "lucide-react"
import { useAuth } from "@/lib/hooks/use-auth"
import { notify } from "@/lib/utils/notifications"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function CheckoutPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const { data: cartData, isLoading: cartLoading } = useSWR(isAuthenticated ? "/api/cart" : null, fetcher)
  const { data: profileData } = useSWR(isAuthenticated ? "/api/users/profile" : null, fetcher)

  const [paymentMethod, setPaymentMethod] = useState("cash_on_delivery")
  const [address, setAddress] = useState("")
  const [phone, setPhone] = useState("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [orderNumber, setOrderNumber] = useState("")

  const items = cartData?.items || []
  const subtotal = cartData?.subtotal || 0
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

  // Pre-fill address from profile
  useState(() => {
    if (profileData?.user) {
      const p = profileData.user
      if (p.address && !address) {
        setAddress(`${p.address}, ${p.city || ""} ${p.postal_code || ""}, ${p.country || ""}`.trim())
      }
      if (p.phone && !phone) {
        setPhone(p.phone)
      }
    }
  })

  const handlePlaceOrder = async () => {
    if (!address.trim()) {
      notify.error("Please enter your shipping address")
      return
    }

    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shipping_address: `${address}${phone ? ` | Phone: ${phone}` : ""}${notes ? ` | Notes: ${notes}` : ""}`,
          payment_method: paymentMethod,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to place order")
      }

      setOrderPlaced(true)
      setOrderNumber(data.order.order_number)
      notify.success("Order placed successfully!", `Order number: ${data.order.order_number}`)
    } catch (err: any) {
      const errorMessage = err.message
      setError(errorMessage)
      notify.error("Failed to place order", errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || cartLoading) {
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
    router.push("/signin")
    return null
  }

  if (orderPlaced) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex flex-col items-center justify-center px-4">
          <CheckCircle className="w-20 h-20 text-green-500 mb-6" />
          <h1 className="text-2xl md:text-3xl font-bold mb-2 text-center">Order Placed Successfully!</h1>
          <p className="text-muted-foreground mb-2 text-center">Thank you for your order.</p>
          <p className="text-lg font-medium mb-6">
            Order Number: <span className="text-primary">{orderNumber}</span>
          </p>
          <div className="flex gap-4">
            <Button asChild>
              <Link href={`/orders/${orderNumber}`}>Track Order</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/shop">Continue Shopping</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  if (items.length === 0) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex flex-col items-center justify-center px-4">
          <ShoppingBag className="w-16 h-16 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">Add some products before checkout</p>
          <Button asChild>
            <Link href="/shop">Continue Shopping</Link>
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
            <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Secure Checkout</h1>
            <p className="text-muted-foreground">Complete your purchase securely</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
              {error && (
                <Alert variant="destructive" className="border-destructive/50 bg-destructive/10 animate-fade-in">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Card className="border-border/50 shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border/50">
                  <CardTitle>Shipping Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="font-semibold">Full Name</Label>
                      <Input 
                        id="name" 
                        value={user?.name || ""} 
                        disabled 
                        className="bg-muted/50 cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="font-semibold">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={user?.email || ""} 
                        disabled 
                        className="bg-muted/50 cursor-not-allowed"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="font-semibold">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="focus:ring-2 focus:ring-primary/50 transition-ring"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address" className="font-semibold">Shipping Address <span className="text-destructive">*</span></Label>
                    <Textarea
                      id="address"
                      placeholder="Enter your complete address with city and postal code"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      rows={3}
                      className="focus:ring-2 focus:ring-primary/50 transition-ring resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes" className="font-semibold">Order Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any special instructions for delivery"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                      className="focus:ring-2 focus:ring-primary/50 transition-ring resize-none"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border/50">
                  <CardTitle>Payment Method</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="flex items-center space-x-3 p-4 border border-border rounded-lg cursor-pointer hover:bg-muted/50 hover:border-primary/50 transition-all duration-200 group">
                      <RadioGroupItem value="cash_on_delivery" id="cod" />
                      <Label htmlFor="cod" className="flex items-center gap-4 cursor-pointer flex-1">
                        <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                          <Banknote className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">Cash on Delivery</p>
                          <p className="text-sm text-muted-foreground">Pay when you receive your order</p>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-4 border border-border/50 rounded-lg cursor-not-allowed opacity-50">
                      <RadioGroupItem value="card" id="card" disabled />
                      <Label htmlFor="card" className="flex items-center gap-4 cursor-not-allowed flex-1">
                        <div className="p-2 bg-muted rounded-lg">
                          <CreditCard className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-muted-foreground">Credit/Debit Card</p>
                          <p className="text-sm text-muted-foreground">Coming soon</p>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div>
              <div className="sticky top-24 animate-fade-in" style={{ animationDelay: '200ms' }}>
                <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 shadow-lg">
                  <CardHeader className="pb-3 border-b border-primary/10">
                    <CardTitle className="text-xl">Order Summary</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{items.length} item{items.length !== 1 ? 's' : ''} in your order</p>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-3 max-h-64 overflow-y-auto pr-2 mb-4">
                      {items.map((item: any, index: number) => {
                        const baseOriginal = Number(item.original_price) + (Number(item.price_modifier) || 0)
                        const baseFinal = Number(item.current_price) + (Number(item.price_modifier) || 0)
                        const lineOriginal = baseOriginal * item.quantity
                        const lineFinal = baseFinal * item.quantity
                        const lineDiscount = baseOriginal > 0 ? Math.round(((baseOriginal - baseFinal) / baseOriginal) * 100) : 0
                        return (
                          <div key={item.id} className="flex gap-3 pb-3 border-b border-border/20 last:border-0 hover:bg-white/30 p-2 rounded transition-colors">
                            <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-muted to-muted/50 shrink-0">
                              <Image
                                src={item.image_url || "/placeholder.svg?height=64&width=64"}
                                alt={item.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold line-clamp-1">{item.name}</p>
                              <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                              <div className="flex items-center gap-2 text-sm font-medium mt-1">
                                <span className="text-primary">Rs. {lineFinal.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    <Separator className="my-4" />
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-semibold">Rs. {totals.original.toLocaleString()}</span>
                      </div>
                      {totalDiscount > 0 && (
                        <div className="flex justify-between items-center text-sm text-green-600">
                          <span className="font-medium">Discount</span>
                          <span className="font-bold">-Rs. {totalDiscount.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Shipping</span>
                        <span className="text-green-600 font-medium">Free</span>
                      </div>
                      <Separator />
                      <div className="bg-white/50 rounded-lg p-3 border border-primary/20">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-foreground">Total Amount</span>
                          <span className="text-2xl font-bold text-primary">Rs. {totals.final.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t border-primary/10 bg-white/30">
                    <Button 
                      className="w-full bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg transition-all duration-300 py-6 text-base font-semibold" 
                      onClick={handlePlaceOrder} 
                      disabled={loading}
                    >
                      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      {loading ? "Processing..." : "Place Order →"}
                    </Button>
                  </CardFooter>
                </Card>
                <p className="text-xs text-muted-foreground text-center mt-4">Your order is secure and encrypted. We never store your card details.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
