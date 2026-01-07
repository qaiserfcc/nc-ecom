"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import {
  Sparkles,
  Leaf,
  Shield,
  Heart,
  Star,
  MessageCircle,
  Send,
  TrendingUp,
  Award,
  Clock,
  Truck,
  CheckCircle2,
} from "lucide-react"
import { notify } from "@/lib/utils/notifications"

interface Product {
  id: number
  name: string
  slug: string
  current_price: number
  original_price: number
  image_url: string
  description?: string
}

interface Testimonial {
  name: string
  role: string
  content: string
  rating: number
  image?: string
}

export default function LuxuryLandingPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch("/api/products?featured=true&limit=8")
        if (response.ok) {
          const data = await response.json()
          setProducts(data.products || [])
        }
      } catch (error) {
        console.error("Error fetching products:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const testimonials: Testimonial[] = [
    {
      name: "Sarah Mitchell",
      role: "Skincare Enthusiast",
      content: "The organic products have transformed my skin completely. Natural, effective, and luxurious!",
      rating: 5,
    },
    {
      name: "Emma Richardson",
      role: "Beauty Blogger",
      content: "Finally found a brand that combines luxury with sustainability. The quality is exceptional!",
      rating: 5,
    },
    {
      name: "Lisa Anderson",
      role: "Verified Customer",
      content: "Best organic cosmetics I've ever used. My skin has never looked better!",
      rating: 5,
    },
  ]

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      notify("error", "Please enter your email address")
      return
    }
    
    // Simulate newsletter signup
    notify("success", "Thank you for subscribing to our newsletter!")
    setEmail("")
  }

  const calculateDiscount = (original: number, current: number) => {
    return Math.round(((original - current) / original) * 100)
  }

  return (
    <div className="bg-[#fcfdfd]">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-rose-50/80 via-pink-50/40 to-orange-50/60">
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <Sparkles className="absolute top-20 left-20 w-16 h-16 text-rose-300/30 animate-pulse" style={{ animationDelay: '0s' }} />
          <Leaf className="absolute top-40 right-32 w-12 h-12 text-green-400/40 animate-float" style={{ animationDelay: '0.5s' }} />
          <Heart className="absolute bottom-32 left-40 w-14 h-14 text-pink-400/30 animate-pulse" style={{ animationDelay: '1s' }} />
          <Shield className="absolute top-60 right-20 w-10 h-10 text-blue-300/30 animate-float" style={{ animationDelay: '1.5s' }} />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-5xl mx-auto animate-slide-up">
            <Badge className="mb-6 px-6 py-2 text-base bg-white/80 backdrop-blur-sm border-rose-200 text-rose-700 shadow-sm">
              <Sparkles className="w-4 h-4 mr-2" />
              Premium Organic Skincare
            </Badge>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-gray-900 mb-6 leading-tight">
              Pure <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500">Luxury</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">Organic Beauty</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-4 max-w-3xl mx-auto">
              Experience the transformative power of nature with our premium organic skincare collection
            </p>
            
            <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-12">
              Handcrafted with the finest natural ingredients for radiant, healthy skin
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link href="/shop">
                <Button size="lg" className="bg-gradient-to-r from-rose-500 to-orange-500 text-white hover:from-rose-600 hover:to-orange-600 font-semibold px-10 py-7 rounded-2xl text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Explore Collection
                </Button>
              </Link>
              <Link href="/story">
                <Button size="lg" variant="outline" className="bg-white/80 backdrop-blur-sm border-gray-300 hover:bg-white font-semibold px-10 py-7 rounded-2xl text-lg transition-all duration-300 hover:-translate-y-0.5">
                  Our Story
                </Button>
              </Link>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { icon: Leaf, text: "100% Organic", color: "text-green-600", bgColor: "bg-green-50" },
                { icon: Shield, text: "Dermatologist Tested", color: "text-blue-600", bgColor: "bg-blue-50" },
                { icon: Award, text: "Cruelty Free", color: "text-purple-600", bgColor: "bg-purple-50" },
                { icon: Truck, text: "Free Shipping", color: "text-orange-600", bgColor: "bg-orange-50" },
              ].map((item, i) => (
                <div key={i} className={`flex items-center gap-2 px-5 py-3 rounded-2xl ${item.bgColor} border border-gray-200 shadow-sm animate-scale-in`} style={{ animationDelay: `${0.3 + i * 0.1}s` }}>
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                  <span className={`${item.color} text-sm font-medium`}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Extra Discount Section */}
      <section className="py-12 bg-gradient-to-r from-orange-500 to-rose-500 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-4">
              <TrendingUp className="w-8 h-8" />
              <h2 className="text-3xl md:text-4xl font-bold">Limited Time Offer</h2>
              <TrendingUp className="w-8 h-8" />
            </div>
            <p className="text-xl md:text-2xl mb-6 font-semibold">
              Get an EXTRA <span className="text-5xl font-bold mx-2">10%</span> OFF
            </p>
            <p className="text-lg opacity-90 mb-6">
              On all organic skincare products + Free shipping on orders over $50
            </p>
            <Link href="/shop">
              <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100 font-bold px-12 py-7 rounded-2xl text-lg shadow-xl">
                Shop Now & Save
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Product Carousel Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4 px-5 py-2 bg-rose-50 text-rose-700 border-rose-200">
              Featured Products
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Our Bestselling Collection
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Carefully curated luxury skincare products for your natural beauty
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto px-12">
              <Carousel
                opts={{
                  align: "start",
                  loop: true,
                }}
                className="w-full"
              >
                <CarouselContent>
                  {products.map((product) => (
                    <CarouselItem key={product.id} className="md:basis-1/2 lg:basis-1/3">
                      <Link href={`/product/${product.slug}`}>
                        <div className="group relative bg-gradient-to-br from-gray-50 to-white rounded-3xl p-6 border border-gray-200 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 h-full">
                          {/* Discount Badge */}
                          {product.original_price > product.current_price && (
                            <Badge className="absolute top-4 right-4 bg-gradient-to-r from-orange-500 to-rose-500 text-white border-0 px-3 py-1">
                              -{calculateDiscount(product.original_price, product.current_price)}%
                            </Badge>
                          )}
                          
                          {/* Product Image */}
                          <div className="relative aspect-square mb-4 rounded-2xl overflow-hidden bg-gradient-to-br from-rose-50 to-orange-50">
                            <Image
                              src={product.image_url || "/placeholder.jpg"}
                              alt={product.name}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          </div>

                          {/* Product Info */}
                          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-rose-600 transition-colors">
                            {product.name}
                          </h3>
                          
                          <div className="flex items-center gap-3 mb-3">
                            <span className="text-2xl font-bold text-gray-900">
                              Rs. {product.current_price.toLocaleString()}
                            </span>
                            {product.original_price > product.current_price && (
                              <span className="text-sm text-gray-400 line-through">
                                Rs. {product.original_price.toLocaleString()}
                              </span>
                            )}
                          </div>

                          <Button className="w-full bg-gradient-to-r from-rose-500 to-orange-500 text-white hover:from-rose-600 hover:to-orange-600 rounded-xl">
                            View Details
                          </Button>
                        </div>
                      </Link>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="hidden md:flex" />
                <CarouselNext className="hidden md:flex" />
              </Carousel>
            </div>
          )}

          <div className="text-center mt-12">
            <Link href="/shop">
              <Button size="lg" variant="outline" className="px-10 py-6 rounded-xl text-base font-semibold">
                View All Products
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-rose-50/50 via-pink-50/30 to-orange-50/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4 px-5 py-2 bg-rose-50 text-rose-700 border-rose-200">
              Customer Stories
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Loved by Thousands
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Real results from real customers who trust our products
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                {/* Star Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Testimonial Content */}
                <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-400 to-orange-400 flex items-center justify-center text-white font-bold text-lg">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-gradient-to-r from-rose-500 to-orange-500">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm mb-6">
              <Send className="w-8 h-8" />
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Join Our Beauty Community
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Subscribe to get exclusive offers, beauty tips, and early access to new products
            </p>

            <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-6 py-6 rounded-xl text-base bg-white/95 backdrop-blur-sm border-0 text-gray-900 placeholder:text-gray-500"
                  required
                />
                <Button
                  type="submit"
                  size="lg"
                  className="bg-white text-rose-600 hover:bg-gray-100 font-bold px-8 py-6 rounded-xl whitespace-nowrap"
                >
                  Subscribe
                  <Send className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </form>

            <p className="text-sm mt-6 opacity-75">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </section>

      {/* Live Chat Widget (Placeholder) */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          size="lg"
          className="bg-gradient-to-r from-rose-500 to-orange-500 text-white hover:from-rose-600 hover:to-orange-600 rounded-full w-16 h-16 p-0 shadow-2xl animate-pulse"
          onClick={() => notify("info", "Live chat feature coming soon!")}
        >
          <MessageCircle className="w-7 h-7" />
        </Button>
      </div>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why Choose Us
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Premium quality meets sustainable luxury
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              {
                icon: Leaf,
                title: "100% Natural",
                description: "Pure organic ingredients sourced ethically",
                color: "from-green-500 to-emerald-600",
                bgColor: "bg-green-50",
              },
              {
                icon: Shield,
                title: "Tested & Safe",
                description: "Dermatologist approved and clinically tested",
                color: "from-blue-500 to-indigo-600",
                bgColor: "bg-blue-50",
              },
              {
                icon: Award,
                title: "Award Winning",
                description: "Recognized for excellence in organic beauty",
                color: "from-purple-500 to-violet-600",
                bgColor: "bg-purple-50",
              },
              {
                icon: Heart,
                title: "Customer Love",
                description: "Trusted by thousands of happy customers",
                color: "from-rose-500 to-pink-600",
                bgColor: "bg-rose-50",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className={`${feature.bgColor} rounded-3xl p-8 border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-center`}
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} mb-4`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
