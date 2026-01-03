import Header from "@/components/header"
import Footer from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Mail, Phone, MapPin, Clock, MessageCircle, Send } from "lucide-react"

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 sm:py-12 md:py-16">
          {/* Hero Section */}
          <div className="text-center mb-12 md:mb-16">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 text-foreground">Contact Us</h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
              We're here to help! Get in touch with our team for any questions or support.
            </p>
          </div>

          {/* Contact Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 md:mb-16">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base mb-2 text-foreground">Phone Numbers</h3>
                    <a href="tel:+923110484849" className="block text-sm text-muted-foreground hover:text-primary transition mb-1">
                      +92 311 0484849
                    </a>
                    <a href="tel:+966561869834" className="block text-sm text-muted-foreground hover:text-primary transition">
                      +966 561 869834
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base mb-2 text-foreground">Email Address</h3>
                    <a href="mailto:qaiserfcc@gmail.com" className="block text-sm text-muted-foreground hover:text-primary transition">
                      qaiserfcc@gmail.com
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base mb-2 text-foreground">Address</h3>
                    <p className="text-sm text-muted-foreground">
                      Township Lahore
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Business Hours and Support */}
          <section className="mb-12 md:mb-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-muted/50">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2 text-foreground">Business Hours</h3>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                        <p>Saturday: 10:00 AM - 4:00 PM</p>
                        <p>Sunday: Closed</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    While our office hours are listed above, our customer support team is available 24/7 via email to assist you with any urgent matters.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-muted/50">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2 text-foreground">Support Channels</h3>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <p>✓ Email Support (24/7)</p>
                        <p>✓ Phone Support (Business Hours)</p>
                        <p>✓ WhatsApp Support</p>
                        <p>✓ Live Chat (Coming Soon)</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Contact Form Section */}
          <section className="bg-muted/50 rounded-xl p-6 sm:p-8 md:p-10">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <Send className="w-12 h-12 text-primary mx-auto mb-4" />
                <h2 className="text-3xl font-bold mb-4 text-foreground">Send Us a Message</h2>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Have a question or feedback? We'd love to hear from you. Fill out the form below or reach out directly using our contact information above.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-base mb-3 text-foreground">What can we help you with?</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="w-2 h-2 rounded-full bg-primary"></span>
                      <span>Product Inquiries</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="w-2 h-2 rounded-full bg-primary"></span>
                      <span>Order Status</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="w-2 h-2 rounded-full bg-primary"></span>
                      <span>Returns & Exchanges</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="w-2 h-2 rounded-full bg-primary"></span>
                      <span>Partnership Opportunities</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="w-2 h-2 rounded-full bg-primary"></span>
                      <span>Referral Program</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="w-2 h-2 rounded-full bg-primary"></span>
                      <span>General Support</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <p className="text-sm text-muted-foreground text-center">
                    For immediate assistance, please call us at{" "}
                    <a href="tel:+923110484849" className="text-primary hover:underline font-medium">
                      +92 311 0484849
                    </a>{" "}
                    or email{" "}
                    <a href="mailto:qaiserfcc@gmail.com" className="text-primary hover:underline font-medium">
                      qaiserfcc@gmail.com
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Company Info */}
          <section className="mt-12 md:mt-16 text-center">
            <h2 className="text-2xl font-bold mb-4 text-foreground">Namecheap</h2>
            <p className="text-muted-foreground mb-2">Premium Organic Beauty & Health Products</p>
            <p className="text-sm text-muted-foreground">
              Building a community of healthy, beautiful people through authentic organic products
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
