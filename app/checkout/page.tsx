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
import { Loader2, CreditCard, Banknote, ShoppingBag, CheckCircle, MessageCircle, Truck } from "lucide-react"
import { useAuth } from "@/lib/hooks/use-auth"
import { notify } from "@/lib/utils/notifications"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function CheckoutPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const { data: cartData, isLoading: cartLoading } = useSWR(isAuthenticated ? "/api/cart" : null, fetcher)
  const { data: profileData } = useSWR(isAuthenticated ? "/api/users/profile" : null, fetcher)
  const { data: shippingData } = useSWR("/api/shipping-methods?activeOnly=true", fetcher)

  const [paymentMethod, setPaymentMethod] = useState("cash_on_delivery")
  const [address, setAddress] = useState("")
  const [phone, setPhone] = useState("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [orderNumber, setOrderNumber] = useState("")
  const [deliveryLocation, setDeliveryLocation] = useState("all")
  const [deliveryTime, setDeliveryTime] = useState("")
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<number | null>(null)

  const items = cartData?.items || []
  const subtotal = cartData?.subtotal || 0
  
  // Use server-calculated totals for consistency
  const totalsData = cartData?.totals
  const originalTotal = totalsData?.original ?? 0
  const sellingTotal = totalsData?.selling ?? 0
  const officialDiscount = totalsData?.officialDiscount ?? 0
  const officialDiscountPercent = totalsData?.officialDiscountPercent ?? 0
  const promoAmount = totalsData?.promoAmount ?? 0
  const promoPercent = totalsData?.promoPercent ?? 0
  const cumulativeDiscount = totalsData?.cumulativeDiscount ?? 0
  const cumulativeDiscountPercent = totalsData?.cumulativeDiscountPercent ?? 0
  const finalAmount = totalsData?.final ?? 0
  const promotionLabel = totalsData?.promotion?.name || (promoAmount > 0 ? `Promotion ${promoPercent}%` : "No promotion active")

  // Calculate shipping cost based on selected method
  const shippingMethods = shippingData?.shippingMethods || []
  const getApplicableShippingMethods = () => {
    return shippingMethods.filter((method: any) => {
      // Check location
      if (method.location_type !== 'all' && method.location_type !== deliveryLocation) {
        return false
      }
      // Check min order amount for free shipping
      if (method.is_free_shipping && method.min_order_amount && finalAmount < method.min_order_amount) {
        return false
      }
      // Check max order amount
      if (method.max_order_amount && finalAmount > method.max_order_amount) {
        return false
      }
      return true
    })
  }

  const applicableShippingMethods = getApplicableShippingMethods()
  const selectedMethod = applicableShippingMethods.find((m: any) => m.id === selectedShippingMethod)
  const shippingCost = selectedMethod ? Number(selectedMethod.base_cost) : 0
  const totalWithShipping = finalAmount + shippingCost

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

  const generateWhatsAppMessage = () => {
    let message = "🛒 *Order Summary*\n\n"
    
    // Add items
    message += "*Items:*\n"
    items.forEach((item: any) => {
      const baseOriginal = Number(item.original_price) + (Number(item.price_modifier) || 0)
      const baseSelling = Number(item.current_price) + (Number(item.price_modifier) || 0)
      const itemSellingTotal = baseSelling * item.quantity
      const itemPromoDiscount = sellingTotal > 0 ? (itemSellingTotal / sellingTotal) * promoAmount : 0
      const baseDiscounted = baseSelling - (itemPromoDiscount / item.quantity)
      
      message += `• ${item.name}\n`
      message += `  Qty: ${item.quantity} × Rs. ${baseDiscounted.toLocaleString()}\n`
      if (promoAmount > 0) {
        message += `  (Official: Rs. ${baseOriginal.toLocaleString()} → Selling: Rs. ${baseSelling.toLocaleString()})\n`
      }
    })
    
    message += "\n*Pricing Breakdown:*\n"
    message += `Official Total: Rs. ${originalTotal.toLocaleString()}\n`
    if (officialDiscount > 0) {
      message += `Official Discount: -${officialDiscountPercent}% (Rs. ${officialDiscount.toLocaleString()})\n`
      message += `After Official Discount: Rs. ${sellingTotal.toLocaleString()}\n`
    }
    if (promoAmount > 0) {
      message += `Our Active Discount: -${promoPercent}% (Rs. ${promoAmount.toLocaleString()})\n`
      message += `Cumulative Discount: -${Math.min(100, cumulativeDiscountPercent)}% (Rs. ${cumulativeDiscount.toLocaleString()})\n`
    }
    message += `\n*Final Amount: Rs. ${finalAmount.toLocaleString()}*\n\n`
    
    message += "*Shipping Details:*\n"
    message += `Address: ${address}\n`
    if (phone) {
      message += `Phone: ${phone}\n`
    }
    if (notes) {
      message += `Notes: ${notes}\n`
    }
    
    message += "\nPlease confirm this order. We'll get back to you soon!"
    
    return message
  }

  const handlePlaceOrder = async () => {
    if (!address.trim()) {
      notify.error("Missing information", "Please enter your shipping address")
      return
    }

    if (!selectedShippingMethod) {
      notify.error("Missing information", "Please select a shipping method")
      return
    }

    setLoading(true)
    setError("")
    
    // Handle WhatsApp payment method
    if (paymentMethod === "whatsapp") {
      const message = generateWhatsAppMessage()
      const whatsappNumber = "923110484849" // Actual business WhatsApp number
      const encodedMessage = encodeURIComponent(message)
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`
      
      notify.success("Preparing WhatsApp message", "Opening WhatsApp...")
      window.open(whatsappUrl, "_blank")
      setLoading(false)
      return
    }

    // Handle Cash on Delivery
    const toastId = notify.loading("Processing your order...")

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shipping_address: `${address}${phone ? ` | Phone: ${phone}` : ""}${notes ? ` | Notes: ${notes}` : ""}`,
          payment_method: paymentMethod,
          shipping_method_id: selectedShippingMethod,
          shipping_cost: shippingCost,
          delivery_time: deliveryTime || null,
          delivery_location: deliveryLocation,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to place order")
      }

      setOrderPlaced(true)
      setOrderNumber(data.order.order_number)
      notify.dismiss(toastId)
      notify.success("Order placed successfully!", `Order #${data.order.order_number} confirmed`)
    } catch (err: any) {
      const errorMessage = err.message
      setError(errorMessage)
      notify.dismiss(toastId)
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
      <main className="min-h-screen bg-[#fcfdfd] py-8 sm:py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8 animate-fade-in">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900">Secure Checkout</h1>
            <p className="text-gray-600">Complete your purchase securely</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
              {error && (
                <Alert variant="destructive" className="border-destructive/50 bg-destructive/10 animate-fade-in">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Card className="bg-white border-gray-100 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="text-gray-900">Shipping Information</CardTitle>
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

              {/* Shipping Method Card */}
              <Card className="bg-white border-gray-100 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <Truck className="w-5 h-5" />
                    Shipping Method
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="delivery_location" className="font-semibold">Delivery Location <span className="text-destructive">*</span></Label>
                    <Select value={deliveryLocation} onValueChange={setDeliveryLocation}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select delivery location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Locations</SelectItem>
                        <SelectItem value="lahore">Lahore</SelectItem>
                        <SelectItem value="out_of_lahore">Outside Lahore</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label className="font-semibold">Select Shipping Method <span className="text-destructive">*</span></Label>
                    <RadioGroup 
                      value={selectedShippingMethod?.toString() || ""} 
                      onValueChange={(value) => setSelectedShippingMethod(Number(value))}
                    >
                      {applicableShippingMethods.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No shipping methods available for selected location</p>
                      ) : (
                        applicableShippingMethods.map((method: any) => (
                          <div 
                            key={method.id}
                            className="flex items-center space-x-3 p-4 border-2 border-border bg-white rounded-2xl cursor-pointer hover:shadow-md hover:border-primary/50 transition-all duration-200 group"
                          >
                            <RadioGroupItem value={method.id.toString()} id={`shipping-${method.id}`} />
                            <Label htmlFor={`shipping-${method.id}`} className="flex items-center gap-4 cursor-pointer flex-1">
                              <div className="p-2 bg-blue-50 rounded-xl group-hover:shadow-sm transition-all">
                                <Truck className="w-5 h-5 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <p className="font-semibold text-foreground">{method.name}</p>
                                <p className="text-sm text-muted-foreground">{method.description}</p>
                                <p className="text-sm font-medium mt-1">
                                  {method.is_free_shipping && method.min_order_amount && finalAmount >= method.min_order_amount 
                                    ? <span className="text-green-600">FREE</span>
                                    : <span>Rs {Number(method.base_cost).toLocaleString()}</span>
                                  }
                                </p>
                              </div>
                            </Label>
                          </div>
                        ))
                      )}
                    </RadioGroup>
                  </div>

                  {selectedMethod?.is_same_day && (
                    <div className="space-y-2">
                      <Label htmlFor="delivery_time" className="font-semibold">Preferred Delivery Time</Label>
                      <Select value={deliveryTime} onValueChange={setDeliveryTime}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select delivery time" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="morning">Morning (9 AM - 12 PM)</SelectItem>
                          <SelectItem value="afternoon">Afternoon (12 PM - 3 PM)</SelectItem>
                          <SelectItem value="evening">Evening (3 PM - 6 PM)</SelectItem>
                          <SelectItem value="night">Night (6 PM - 9 PM)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-100 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="text-gray-900">Payment Method</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="flex items-center space-x-3 p-4 border-2 border-primary bg-white rounded-2xl cursor-pointer hover:shadow-md hover:border-primary/80 transition-all duration-200 group">
                      <RadioGroupItem value="cash_on_delivery" id="cod" />
                      <Label htmlFor="cod" className="flex items-center gap-4 cursor-pointer flex-1">
                        <div className="p-2 bg-[#e0e5ce] rounded-xl group-hover:shadow-sm transition-all">
                          <Banknote className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-foreground">Cash on Delivery</p>
                          <p className="text-sm text-muted-foreground">Pay when you receive your order</p>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-4 border border-border/50 bg-muted/30 rounded-2xl cursor-not-allowed opacity-50">
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
                    <div className="flex items-center space-x-3 p-4 border-2 border-[#25D366] bg-[#25D366]/5 rounded-2xl cursor-pointer hover:shadow-md hover:border-[#25D366]/80 transition-all duration-200 group">
                      <RadioGroupItem value="whatsapp" id="whatsapp" />
                      <Label htmlFor="whatsapp" className="flex items-center gap-4 cursor-pointer flex-1">
                        <div className="p-2 bg-[#25D366]/20 rounded-xl group-hover:shadow-sm transition-all">
                          <MessageCircle className="w-5 h-5 text-[#25D366]" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-foreground">Order via WhatsApp</p>
                          <p className="text-sm text-muted-foreground">Chat with us to confirm your order</p>
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
                <Card className="bg-white border-gray-100 rounded-3xl shadow-sm">
                  <CardHeader className="pb-3 border-b border-gray-100">
                    <CardTitle className="text-xl text-gray-900">Order Summary</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{items.length} item{items.length !== 1 ? 's' : ''} in your order</p>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-3 max-h-64 overflow-y-auto pr-2 mb-4">
                      {items.map((item: any, index: number) => {
                        const baseOriginal = Number(item.original_price) + (Number(item.price_modifier) || 0)
                        const baseSelling = Number(item.current_price) + (Number(item.price_modifier) || 0)
                        // Calculate per-item promotion discount proportionally
                        const itemSellingTotal = baseSelling * item.quantity
                        const itemPromoDiscount = sellingTotal > 0 ? (itemSellingTotal / sellingTotal) * promoAmount : 0
                        const baseDiscounted = baseSelling - (itemPromoDiscount / item.quantity)
                        const lineOriginal = baseOriginal * item.quantity
                        const lineSelling = baseSelling * item.quantity
                        const lineDiscounted = lineSelling - itemPromoDiscount
                        return (
                          <div key={item.id} className="flex gap-3 pb-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 p-2 rounded-2xl transition-colors">
                            <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-[#e0e5ce] shrink-0">
                              <Image
                                src={item.image_url || "/placeholder.svg?height=64&width=64"}
                                alt={item.name}
                                fill
                                className="object-cover"
                                loading="lazy"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold line-clamp-1 break-words">{item.name}</p>
                              <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                              <div className="space-y-1 mt-1 text-xs">
                                <div className="flex items-center justify-between text-muted-foreground">
                                  <span>Official</span>
                                  <span className="line-through">Rs. {baseOriginal.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center justify-between text-muted-foreground">
                                  <span>Selling</span>
                                  <span className={promoAmount > 0 ? "line-through" : "font-semibold"}>Rs. {baseSelling.toLocaleString()}</span>
                                </div>
                                {promoAmount > 0 && (
                                  <div className="flex items-center justify-between font-semibold text-primary">
                                    <span>Discounted</span>
                                    <span>Rs. {baseDiscounted.toLocaleString()}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    <Separator className="my-4" />
                    <div className="space-y-3">
                      <div className="space-y-2 bg-gray-50 rounded-2xl p-3 border border-gray-100">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">Official Price ({items.length} items)</span>
                          <span className="font-semibold">Rs. {originalTotal.toLocaleString()}</span>
                        </div>
                        {officialDiscount > 0 && (
                          <>
                            <div className="flex justify-between items-center text-xs border-t pt-2">
                              <span className="text-muted-foreground">Official Discount</span>
                              <span className="text-green-500 font-semibold">-{officialDiscountPercent}% (Rs. {officialDiscount.toLocaleString()})</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-muted-foreground">After Official Discount</span>
                              <span className="font-semibold">Rs. {sellingTotal.toLocaleString()}</span>
                            </div>
                          </>
                        )}
                        {promoAmount > 0 && (
                          <>
                            <div className="flex justify-between items-center text-xs border-t pt-2">
                              <span className="text-muted-foreground">Our Active Discount</span>
                              <span className="text-green-500 font-semibold">-{promoPercent}% (Rs. {promoAmount.toLocaleString()})</span>
                            </div>
                            <div className="flex justify-between items-center text-xs text-primary font-semibold border-t pt-2">
                              <span>Cumulative Discount</span>
                              <span>{Math.min(100, cumulativeDiscountPercent)}% (Rs. {cumulativeDiscount.toLocaleString()})</span>
                            </div>
                          </>
                        )}
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Shipping</span>
                        <span className={shippingCost === 0 ? "text-green-600 font-medium" : "font-medium"}>
                          {shippingCost === 0 ? "Free" : `Rs ${shippingCost.toLocaleString()}`}
                        </span>
                      </div>
                      <Separator />
                      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-4 border border-primary/20">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold">Final Payable</span>
                          <span className="text-2xl font-bold text-primary">Rs {totalWithShipping.toLocaleString()}</span>
                        </div>
                        {promoAmount > 0 && <p className="text-xs text-muted-foreground mt-1">{promotionLabel}</p>}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t border-gray-100">
                    <Button 
                      className="w-full rounded-2xl hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 py-6 text-base font-semibold" 
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
