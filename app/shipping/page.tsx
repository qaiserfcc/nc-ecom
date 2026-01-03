import Header from "@/components/header"
import Footer from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Truck, Package, MapPin, Clock, Shield, DollarSign, Globe, CheckCircle } from "lucide-react"

export default function ShippingPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 sm:py-12 md:py-16">
          {/* Hero Section */}
          <div className="text-center mb-12 md:mb-16">
            <Truck className="w-16 h-16 text-primary mx-auto mb-4" />
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 text-foreground">Shipping Information</h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
              Fast, reliable, and secure delivery of your organic products
            </p>
          </div>

          {/* Shipping Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 md:mb-16">
            <Card>
              <CardContent className="pt-6 text-center">
                <Clock className="w-10 h-10 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-base mb-2">Fast Delivery</h3>
                <p className="text-sm text-muted-foreground">3-7 business days</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Shield className="w-10 h-10 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-base mb-2">Secure Packaging</h3>
                <p className="text-sm text-muted-foreground">Safe & protected</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <DollarSign className="w-10 h-10 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-base mb-2">Free Shipping</h3>
                <p className="text-sm text-muted-foreground">On orders above threshold</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <MapPin className="w-10 h-10 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-base mb-2">Order Tracking</h3>
                <p className="text-sm text-muted-foreground">Real-time updates</p>
              </CardContent>
            </Card>
          </div>

          {/* Shipping Rates */}
          <section className="mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-foreground">Shipping Rates</h2>
            <div className="bg-muted/50 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-primary/10">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Order Value</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Shipping Cost</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Delivery Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-border">
                      <td className="px-6 py-4 text-sm text-muted-foreground">Below Rs. 2,000</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">Rs. 150</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">5-7 business days</td>
                    </tr>
                    <tr className="border-t border-border bg-muted/30">
                      <td className="px-6 py-4 text-sm text-muted-foreground">Rs. 2,000 - Rs. 4,999</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">Rs. 100</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">4-6 business days</td>
                    </tr>
                    <tr className="border-t border-border">
                      <td className="px-6 py-4 text-sm text-muted-foreground">Rs. 5,000 and above</td>
                      <td className="px-6 py-4 text-sm font-semibold text-primary">FREE</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">3-5 business days</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              * Shipping costs and delivery times may vary for remote areas and international orders.
            </p>
          </section>

          {/* Delivery Areas */}
          <section className="mb-12 md:mb-16">
            <div className="flex items-center gap-3 mb-6">
              <Globe className="w-8 h-8 text-primary" />
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Delivery Areas</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-lg mb-4 text-foreground">Pakistan</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    We deliver to all major cities and towns across Pakistan including:
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      <span>Lahore</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      <span>Karachi</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      <span>Islamabad</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      <span>Rawalpindi</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      <span>Faisalabad</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      <span>Multan</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      <span>Peshawar</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      <span>Quetta</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    And many more cities across the country.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-lg mb-4 text-foreground">International</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    We currently ship to select Middle Eastern countries:
                  </p>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      <span>Saudi Arabia</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      <span>United Arab Emirates</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      <span>Qatar</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    International shipping rates and delivery times vary by destination. Contact us for specific details.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Order Processing */}
          <section className="mb-12 md:mb-16">
            <div className="flex items-center gap-3 mb-6">
              <Package className="w-8 h-8 text-primary" />
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Order Processing</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-primary/5">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mb-4 font-bold text-lg">
                    1
                  </div>
                  <h3 className="font-semibold text-base mb-2 text-foreground">Order Confirmation</h3>
                  <p className="text-sm text-muted-foreground">
                    You'll receive an email confirmation within minutes of placing your order with all order details.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-primary/5">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mb-4 font-bold text-lg">
                    2
                  </div>
                  <h3 className="font-semibold text-base mb-2 text-foreground">Processing & Packaging</h3>
                  <p className="text-sm text-muted-foreground">
                    Orders are processed within 24 hours and carefully packaged to ensure safe delivery.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-primary/5">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mb-4 font-bold text-lg">
                    3
                  </div>
                  <h3 className="font-semibold text-base mb-2 text-foreground">Shipping & Delivery</h3>
                  <p className="text-sm text-muted-foreground">
                    Your order is shipped with tracking information sent to your email and phone number.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Packaging & Safety */}
          <section className="mb-12 md:mb-16 bg-muted/50 rounded-xl p-6 sm:p-8 md:p-10">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-foreground">Packaging & Safety</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-3 text-foreground">Secure Packaging</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  All products are carefully wrapped and packed in sturdy boxes to prevent damage during transit. Fragile items receive extra protective packaging.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-3 text-foreground">Temperature Control</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Products that require temperature control are shipped with appropriate insulation to maintain quality during delivery.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-3 text-foreground">Eco-Friendly Materials</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  We use recyclable and biodegradable packaging materials whenever possible to minimize environmental impact.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-3 text-foreground">Discreet Shipping</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Your orders are shipped in plain packaging with no indication of the contents for your privacy.
                </p>
              </div>
            </div>
          </section>

          {/* Tracking Your Order */}
          <section className="mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-foreground">Tracking Your Order</h2>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-4">
                  Stay updated on your order's journey from our warehouse to your doorstep:
                </p>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">
                      ✓
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">Email Notifications</p>
                      <p className="text-xs text-muted-foreground">
                        Receive updates at every stage: order confirmation, processing, shipped, and delivered.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">
                      ✓
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">SMS Updates</p>
                      <p className="text-xs text-muted-foreground">
                        Get real-time SMS notifications with tracking number and delivery status.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">
                      ✓
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">Account Dashboard</p>
                      <p className="text-xs text-muted-foreground">
                        Track all your orders from your account dashboard with detailed status information.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Contact for Shipping Questions */}
          <section className="bg-muted/50 rounded-xl p-6 sm:p-8 md:p-10 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-foreground">Questions About Shipping?</h2>
            <p className="text-muted-foreground mb-6 text-sm sm:text-base max-w-2xl mx-auto">
              Our customer support team is here to help with any shipping-related questions or concerns.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:qaiserfcc@gmail.com"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition font-medium"
              >
                Email: qaiserfcc@gmail.com
              </a>
              <a
                href="tel:+923110484849"
                className="inline-flex items-center justify-center px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition font-medium"
              >
                Call: +92 311 0484849
              </a>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
