import Header from "@/components/header"
import Footer from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, Users, Leaf, Award, Target, TrendingUp, Globe, ShieldCheck } from "lucide-react"

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 sm:py-12 md:py-16">
          {/* Hero Section */}
          <div className="text-center mb-12 md:mb-16">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 text-foreground">About Namecheap</h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
              Your trusted partner for premium organic beauty and health products
            </p>
          </div>

          {/* Our Story Section */}
          <section className="mb-12 md:mb-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">Our Story</h2>
                <p className="text-muted-foreground mb-4 text-sm sm:text-base leading-relaxed">
                  Namecheap began with a simple vision: to make premium organic and natural products accessible to everyone while building a community that benefits together. We believe that beauty and health products should be pure, effective, and ethically sourced.
                </p>
                <p className="text-muted-foreground mb-4 text-sm sm:text-base leading-relaxed">
                  What started as a small initiative to source the best organic products has grown into a thriving marketplace where quality meets affordability. Our unique profit-sharing model ensures that our success is your success.
                </p>
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                  Today, we serve thousands of customers who trust us for authentic organic products, transparent pricing, and a commitment to sustainable practices. Every purchase you make supports not just your health and beauty, but also a more sustainable future.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-primary/10">
                  <CardContent className="pt-6 text-center">
                    <Heart className="w-8 h-8 sm:w-10 sm:h-10 mx-auto text-primary mb-3" />
                    <p className="font-semibold text-sm sm:text-base text-foreground mb-1">Quality First</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">100% authentic organic products</p>
                  </CardContent>
                </Card>
                <Card className="bg-secondary/10">
                  <CardContent className="pt-6 text-center">
                    <Users className="w-8 h-8 sm:w-10 sm:h-10 mx-auto text-secondary mb-3" />
                    <p className="font-semibold text-sm sm:text-base text-foreground mb-1">Community First</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Share profits with referrals</p>
                  </CardContent>
                </Card>
                <Card className="bg-accent/10">
                  <CardContent className="pt-6 text-center">
                    <Leaf className="w-8 h-8 sm:w-10 sm:h-10 mx-auto text-accent mb-3" />
                    <p className="font-semibold text-sm sm:text-base text-foreground mb-1">Eco-Friendly</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Sustainable sourcing practices</p>
                  </CardContent>
                </Card>
                <Card className="bg-destructive/10">
                  <CardContent className="pt-6 text-center">
                    <Award className="w-8 h-8 sm:w-10 sm:h-10 mx-auto text-destructive mb-3" />
                    <p className="font-semibold text-sm sm:text-base text-foreground mb-1">Trusted</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">10,000+ satisfied customers</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Press Section */}
          <section className="mb-12 md:mb-16 bg-muted/50 rounded-xl p-6 sm:p-8 md:p-10">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-foreground">Press & Media</h2>
            <p className="text-muted-foreground mb-6 text-sm sm:text-base leading-relaxed">
              For press inquiries, media partnerships, or interview requests, please contact our media team at{" "}
              <a href="mailto:qaiserfcc@gmail.com" className="text-primary hover:underline">
                qaiserfcc@gmail.com
              </a>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <Globe className="w-8 h-8 text-primary mb-3" />
                  <h3 className="font-semibold text-base mb-2">Brand Assets</h3>
                  <p className="text-sm text-muted-foreground">
                    Download our logo, brand guidelines, and media kit for publications.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <TrendingUp className="w-8 h-8 text-primary mb-3" />
                  <h3 className="font-semibold text-base mb-2">Latest News</h3>
                  <p className="text-sm text-muted-foreground">
                    Stay updated with our latest announcements, partnerships, and product launches.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <ShieldCheck className="w-8 h-8 text-primary mb-3" />
                  <h3 className="font-semibold text-base mb-2">Certifications</h3>
                  <p className="text-sm text-muted-foreground">
                    View our organic certifications and quality assurance standards.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Shopping Information */}
          <section className="mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-foreground">Shopping with Namecheap</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">Bulk Buy Discounts</h3>
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                  Save more when you buy more! Our tiered pricing system automatically applies discounts when you purchase in bulk. Whether you're stocking up for yourself or sharing with family and friends, you'll enjoy better prices.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">Referral Profits</h3>
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                  Join our community and earn commission by sharing products you love. Every successful referral puts money back in your pocket. It's our way of thanking you for spreading the word about organic living.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">Product Bundles</h3>
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                  Explore our curated product bundles designed to save you time and money. Each bundle is carefully selected to provide complete solutions for your beauty and health needs at special prices.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">Secure Checkout</h3>
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                  Shop with confidence using our secure payment gateway. We accept multiple payment methods including cash on delivery, ensuring a safe and convenient shopping experience.
                </p>
              </div>
            </div>
          </section>

          {/* Support Section */}
          <section className="bg-muted/50 rounded-xl p-6 sm:p-8 md:p-10">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-foreground">Customer Support</h2>
            <p className="text-muted-foreground mb-6 text-sm sm:text-base leading-relaxed">
              Our dedicated support team is here to help you with any questions or concerns. We're committed to providing exceptional service and ensuring your satisfaction.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 mt-1 text-xs font-bold">
                  ✓
                </div>
                <div>
                  <p className="font-semibold text-sm sm:text-base text-foreground">24/7 Support</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Contact us anytime through email, phone, or live chat
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 mt-1 text-xs font-bold">
                  ✓
                </div>
                <div>
                  <p className="font-semibold text-sm sm:text-base text-foreground">Easy Returns</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Hassle-free return policy within 30 days of purchase
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 mt-1 text-xs font-bold">
                  ✓
                </div>
                <div>
                  <p className="font-semibold text-sm sm:text-base text-foreground">Product Guidance</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Expert advice on choosing the right products for your needs
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 mt-1 text-xs font-bold">
                  ✓
                </div>
                <div>
                  <p className="font-semibold text-sm sm:text-base text-foreground">Order Tracking</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Real-time updates on your order status and delivery
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
