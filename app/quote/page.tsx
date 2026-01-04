"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/hooks/use-auth"
import { notify } from "@/lib/utils/notifications"
import { Loader2, MessageSquare, CheckCircle, Clock, XCircle } from "lucide-react"

interface Quote {
  id: number
  customer_name: string
  customer_email: string
  customer_phone: string
  product_details: string
  quantity: number
  additional_notes: string
  status: string
  quoted_price: number | null
  admin_notes: string | null
  created_at: string
  updated_at: string
}

export default function QuotePage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()
  const [submitting, setSubmitting] = useState(false)
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loadingQuotes, setLoadingQuotes] = useState(true)

  // Form state
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    product_details: "",
    quantity: 1,
    additional_notes: "",
  })

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/signin")
      return
    }

    if (user) {
      setFormData((prev) => ({
        ...prev,
        customer_name: user.name || "",
        customer_email: user.email || "",
      }))
      fetchQuotes()
    }
  }, [isAuthenticated, isLoading, user, router])

  const fetchQuotes = async () => {
    try {
      const response = await fetch("/api/quotes")
      if (response.ok) {
        const data = await response.json()
        setQuotes(data.quotes || [])
      }
    } catch (error) {
      console.error("Error fetching quotes:", error)
    } finally {
      setLoadingQuotes(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.customer_name || !formData.customer_email || !formData.product_details) {
      notify.error("Please fill in all required fields")
      return
    }

    setSubmitting(true)
    const toastId = notify.loading("Submitting quote request...")

    try {
      const response = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to submit quote request")
      }

      const data = await response.json()
      notify.dismiss(toastId)
      notify.success("Quote request submitted!", "We'll get back to you soon")
      
      // Reset form (except name and email)
      setFormData({
        customer_name: user?.name || "",
        customer_email: user?.email || "",
        customer_phone: "",
        product_details: "",
        quantity: 1,
        additional_notes: "",
      })
      
      // Refresh quotes list
      fetchQuotes()
    } catch (error) {
      notify.dismiss(toastId)
      notify.error("Failed to submit quote request", "Please try again")
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />
      case "reviewed":
      case "quoted":
        return <MessageSquare className="w-4 h-4" />
      case "accepted":
      case "completed":
        return <CheckCircle className="w-4 h-4" />
      case "rejected":
        return <XCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500"
      case "reviewed":
      case "quoted":
        return "bg-blue-500"
      case "accepted":
      case "completed":
        return "bg-green-500"
      case "rejected":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-screen py-8 sm:py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">Request a Quote</h1>
            <p className="text-muted-foreground">
              Need a custom quote? Fill out the form below and we will get back to you as soon as possible.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>New Quote Request</CardTitle>
                <CardDescription>
                  Provide details about your product requirements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="customer_name">Name *</Label>
                    <Input
                      id="customer_name"
                      name="customer_name"
                      value={formData.customer_name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customer_email">Email *</Label>
                    <Input
                      id="customer_email"
                      name="customer_email"
                      type="email"
                      value={formData.customer_email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customer_phone">Phone Number</Label>
                    <Input
                      id="customer_phone"
                      name="customer_phone"
                      type="tel"
                      value={formData.customer_phone}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="product_details">Product Details *</Label>
                    <Textarea
                      id="product_details"
                      name="product_details"
                      value={formData.product_details}
                      onChange={handleChange}
                      placeholder="Describe the product or service you need..."
                      rows={4}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      name="quantity"
                      type="number"
                      min="1"
                      value={formData.quantity}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="additional_notes">Additional Notes</Label>
                    <Textarea
                      id="additional_notes"
                      name="additional_notes"
                      value={formData.additional_notes}
                      onChange={handleChange}
                      placeholder="Any additional information..."
                      rows={3}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Quote Request"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>My Quote Requests</CardTitle>
                  <CardDescription>
                    Track the status of your quote requests
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingQuotes ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : quotes.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No quote requests yet
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {quotes.map((quote) => (
                        <Card key={quote.id} className="border-border/50">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge className={getStatusColor(quote.status)}>
                                    {getStatusIcon(quote.status)}
                                    <span className="ml-1 capitalize">{quote.status}</span>
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(quote.created_at).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-sm font-medium mb-1">
                                  {quote.product_details}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Quantity: {quote.quantity}
                                </p>
                              </div>
                            </div>
                            
                            {quote.quoted_price && (
                              <div className="mt-2 p-2 bg-primary/10 rounded">
                                <p className="text-sm font-semibold text-primary">
                                  Quoted Price: Rs. {quote.quoted_price.toLocaleString()}
                                </p>
                              </div>
                            )}
                            
                            {quote.admin_notes && (
                              <div className="mt-2 p-2 bg-muted rounded">
                                <p className="text-xs font-medium mb-1">Admin Response:</p>
                                <p className="text-sm">{quote.admin_notes}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
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
