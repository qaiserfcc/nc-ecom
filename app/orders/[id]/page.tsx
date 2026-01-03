"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import useSWR from "swr"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Loader2, Package, ChevronLeft, CheckCircle, Truck, Clock, XCircle } from "lucide-react"
import { useAuth } from "@/lib/hooks/use-auth"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const statusSteps = ["pending", "confirmed", "processing", "shipped", "delivered"]

const statusIcons: Record<string, any> = {
  pending: Clock,
  confirmed: CheckCircle,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-purple-100 text-purple-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { data, isLoading, error } = useSWR(isAuthenticated ? `/api/orders/${id}` : null, fetcher)

  const order = data?.order

  if (authLoading || isLoading) {
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

  if (error || !order) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex flex-col items-center justify-center px-4">
          <Package className="w-16 h-16 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Order not found</h1>
          <p className="text-muted-foreground mb-6">This order does not exist or you don&apos;t have access</p>
          <Button asChild>
            <Link href="/orders">Back to Orders</Link>
          </Button>
        </div>
        <Footer />
      </>
    )
  }

  const currentStepIndex = statusSteps.indexOf(order.status)
  const StatusIcon = statusIcons[order.status] || Clock

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Button variant="ghost" size="sm" className="mb-4" onClick={() => router.back()}>
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Orders
          </Button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Order {order.order_number}</h1>
              <p className="text-muted-foreground">
                Placed on{" "}
                {new Date(order.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <Badge className={`${statusColors[order.status]} text-sm px-3 py-1`}>
              <StatusIcon className="w-4 h-4 mr-1" />
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Badge>
          </div>

          {/* Order Progress */}
          {order.status !== "cancelled" && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Order Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  {statusSteps.map((step, index) => {
                    const isCompleted = index <= currentStepIndex
                    const isCurrent = index === currentStepIndex
                    const StepIcon = statusIcons[step]
                    return (
                      <div key={step} className="flex flex-col items-center flex-1">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            isCompleted ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                          } ${isCurrent ? "ring-2 ring-primary ring-offset-2" : ""}`}
                        >
                          <StepIcon className="w-5 h-5" />
                        </div>
                        <p
                          className={`text-xs mt-2 capitalize ${
                            isCompleted ? "text-foreground font-medium" : "text-muted-foreground"
                          }`}
                        >
                          {step}
                        </p>
                        {index < statusSteps.length - 1 && (
                          <div
                            className={`hidden sm:block absolute h-1 w-full top-5 left-1/2 ${
                              index < currentStepIndex ? "bg-primary" : "bg-muted"
                            }`}
                            style={{ width: "calc(100% - 2.5rem)" }}
                          />
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Order Items */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Order Items</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {order.items?.map((item: any) => {
                    const baseOriginal = Number(item.original_price_at_purchase ?? item.price_at_purchase)
                    const baseFinal = Number(item.price_at_purchase)
                    const lineOriginal = baseOriginal * item.quantity
                    const lineFinal = baseFinal * item.quantity
                    const lineDiscountPercent = baseOriginal > 0 ? Math.round(((baseOriginal - baseFinal) / baseOriginal) * 100) : 0
                    return (
                      <div key={item.id} className="flex gap-4">
                        <div className="relative w-20 h-20 rounded overflow-hidden bg-muted shrink-0">
                          <Image
                            src={item.product_image || "/placeholder.svg?height=80&width=80"}
                            alt={item.product_name}
                            fill
                            className="object-cover"
                          />
                          {lineDiscountPercent > 0 && (
                            <Badge variant="secondary" className="absolute top-2 right-2 text-[11px] px-2 py-0">
                              {lineDiscountPercent}%
                            </Badge>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{item.product_name}</h3>
                          <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-primary">Rs. {lineFinal.toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground line-through">Rs. {lineOriginal.toLocaleString()}</p>
                          </div>
                        </div>
                        <p className="font-medium">Rs. {lineFinal.toLocaleString()}</p>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Original</span>
                    <span className="line-through">
                      Rs. {(Number(order.subtotal) + Number(order.discount_applied || 0)).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>
                      -Rs. {Number(order.discount_applied || 0).toLocaleString()} (
                      {Number(order.subtotal) + Number(order.discount_applied || 0) > 0
                        ? Math.round((Number(order.discount_applied || 0) /
                            (Number(order.subtotal) + Number(order.discount_applied || 0))) * 100)
                        : 0}
                      %)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">Rs. {Number(order.total_amount).toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Shipping Address</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{order.shipping_address || "Not provided"}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm capitalize">{order.payment_method?.replace(/_/g, " ")}</p>
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
