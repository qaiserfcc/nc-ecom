"use client"

import { useEffect, useRef, useState } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import {
  ChevronDown,
  ShoppingBag,
  Search,
  Leaf,
  Users,
  User,
  Handshake,
  PiggyBank,
  Heart,
  Clock,
  DollarSign,
  TrendingUp,
  Shield,
  Package,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Target,
  Truck,
  BadgePercent,
  Building2,
  Lightbulb,
  BarChart3,
  Globe,
  MessageCircle,
} from "lucide-react"

function StoryContent() {
  const [activeSection, setActiveSection] = useState(0)
  const [isVisible, setIsVisible] = useState<boolean[]>(Array(6).fill(false))
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([])
  // Animation helpers
  const [shareAnimTick, setShareAnimTick] = useState(0)
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReducedMotion) return
    const id = setInterval(() => setShareAnimTick((t) => (t + 1) % 1000), 1200)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const observers = sectionRefs.current.map((ref, index) => {
      if (!ref) return null
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(index)
              setIsVisible((prev) => {
                const next = [...prev]
                next[index] = true
                return next
              })
            }
          })
        },
        { threshold: 0.5 }
      )
      observer.observe(ref)
      return observer
    })
    return () => { observers.forEach((o) => o?.disconnect()) }
  }, [])

  const setSectionRef = (index: number) => (el: HTMLDivElement | null) => {
    sectionRefs.current[index] = el
  }

  const steps = [
    { number: 0, label: "Start" },
    { number: 1, label: "Study" },
    { number: 2, label: "Identify" },
    { number: 3, label: "Collaborate" },
    { number: 4, label: "Unlock" },
    { number: 5, label: "Share" },
  ]

  return (
    <div className="bg-[#fcfdfd]">
      {/* Progress Indicator */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col gap-2">
        {steps.map((step, i) => (
          <button key={i} onClick={() => sectionRefs.current[i]?.scrollIntoView({ behavior: "smooth" })} className="group flex items-center gap-3">
            <span className={`text-xs font-medium transition-all duration-300 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 ${activeSection === i ? "text-[#ff5f00]" : "text-gray-400"}`}>{step.label}</span>
            <div className={`w-3 h-3 rounded-full transition-all duration-300 ${activeSection > i ? "bg-[#ff5f00] scale-75" : activeSection === i ? "bg-[#ff5f00] scale-125 ring-4 ring-orange-100" : "bg-gray-200 scale-75 group-hover:bg-gray-300"}`} />
          </button>
        ))}
      </div>

      {/* Section 0 - Hero - Shopping Journey Start */}
      <section ref={setSectionRef(0)} className="snap-section min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-orange-50/80 via-amber-50/40 to-yellow-50/60">
        {/* Animated Shopping Bags floating around */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <ShoppingBag className="absolute top-20 left-20 w-16 h-16 text-orange-300/30 animate-float" style={{ animationDelay: '0s' }} />
          <Sparkles className="absolute top-40 right-32 w-12 h-12 text-amber-400/40 animate-pulse" style={{ animationDelay: '0.5s' }} />
          <BadgePercent className="absolute bottom-32 left-40 w-14 h-14 text-orange-400/30 animate-bounce-slow" style={{ animationDelay: '1s' }} />
          <Heart className="absolute top-60 right-20 w-10 h-10 text-red-300/30 animate-pulse" style={{ animationDelay: '1.5s' }} />
        </div>

        <div className={`text-center px-6 max-w-5xl relative z-10 ${isVisible[0] ? "animate-slide-up" : "opacity-0"}`}>
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-gray-200 text-gray-700 text-sm mb-8 shadow-sm">
            <Sparkles className="w-4 h-4" />
            <span className="font-medium">Discover How We Save You More</span>
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-gray-900 mb-6 leading-tight">
            The <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff5f00] to-[#ff8f40]">Namecheap</span>
            <br />
            <span className="text-gray-600">Extra Discount</span> Story
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-4 max-w-3xl mx-auto">How We Deliver Unbeatable Savings on Premium Organic Products</p>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-12">Scroll through our 5-step journey and discover the secret behind our extraordinary discounts that benefit both local brands and smart shoppers like you.</p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button size="lg" className="bg-gray-900 text-white hover:bg-gray-800 font-semibold px-10 py-7 rounded-2xl text-lg shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5" onClick={() => sectionRefs.current[1]?.scrollIntoView({ behavior: "smooth" })}>
              Start the Journey
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button size="lg" className="bg-gradient-to-r from-[#ff5f00] to-[#ff8f40] text-white hover:from-[#ff6f10] hover:to-[#ffa050] font-semibold px-10 py-7 rounded-2xl text-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
              <ShoppingBag className="w-5 h-5 mr-2" />
              Shop Now
            </Button>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { icon: Shield, text: "100% Authentic", color: "from-blue-500 to-indigo-600", bgColor: "bg-blue-50", iconColor: "text-blue-600" },
              { icon: Leaf, text: "Certified Organic", color: "from-green-500 to-emerald-600", bgColor: "bg-green-50", iconColor: "text-green-600" },
              { icon: Truck, text: "Fast Delivery", color: "from-purple-500 to-violet-600", bgColor: "bg-purple-50", iconColor: "text-purple-600" },
              { icon: BadgePercent, text: "Extra 10% Off", color: "from-orange-500 to-amber-600", bgColor: "bg-orange-50", iconColor: "text-orange-600" },
            ].map((item, i) => (
              <div key={i} className={`flex items-center gap-2 px-4 py-2 rounded-2xl ${item.bgColor} border border-gray-200 shadow-sm ${isVisible[0] ? "animate-scale-in" : "opacity-0"}`} style={{ animationDelay: `${0.5 + i * 0.1}s` }}>
                <item.icon className={`w-4 h-4 ${item.iconColor}`} />
                <span className={`${item.iconColor} text-sm font-medium`}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-400 text-sm animate-bounce-slow">
          <span>Scroll to explore</span>
          <ChevronDown className="w-5 h-5" />
        </div>
      </section>

      {/* Section 1 - Study User Needs (analysis vibes) */}
      <section ref={setSectionRef(1)} className="snap-section min-h-screen flex items-center justify-center relative py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Animated analysis glyphs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <BarChart3 className="absolute top-12 right-20 w-16 h-16 text-indigo-300/40 animate-float" />
          <Search className="absolute bottom-16 left-24 w-14 h-14 text-blue-300/40 animate-pulse" />
        </div>
        <div className="w-full max-w-7xl px-6 relative z-10">
          <div className={`text-center mb-16 ${isVisible[1] ? "animate-slide-up" : "opacity-0"}`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 text-gray-700 text-sm mb-6 shadow-sm">
              <Target className="w-4 h-4" />
              Step 1 of 5
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">Study User Needs</h2>
            <p className="text-gray-500 text-xl max-w-2xl mx-auto">Understanding what matters most to our customers through deep research and analysis</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              { icon: DollarSign, title: "Budget-Conscious Buyers", pain: "Finding authentic deals without compromising quality", stat: "89%", statLabel: "Want better prices", color: "from-green-500 to-emerald-600", bgColor: "bg-gradient-to-br from-green-50 to-emerald-50", borderColor: "border-green-200", iconBg: "bg-green-100", iconColor: "text-green-600" },
              { icon: Heart, title: "Health-Focused Families", pain: "Organic products at affordable prices for daily use", stat: "76%", statLabel: "Trust organic brands", color: "from-pink-500 to-rose-600", bgColor: "bg-gradient-to-br from-pink-50 to-rose-50", borderColor: "border-pink-200", iconBg: "bg-pink-100", iconColor: "text-pink-600" },
              { icon: Clock, title: "Smart Time-Savers", pain: "Quick access to quality products without endless searching", stat: "92%", statLabel: "Compare before buying", color: "from-blue-500 to-indigo-600", bgColor: "bg-gradient-to-br from-blue-50 to-indigo-50", borderColor: "border-blue-200", iconBg: "bg-blue-100", iconColor: "text-blue-600" },
            ].map((item, i) => (
              <div key={i} className={`group relative p-8 rounded-3xl ${item.bgColor} border ${item.borderColor} hover:shadow-xl transition-all duration-500 hover:-translate-y-0.5 ${isVisible[1] ? "animate-slide-up" : "opacity-0"}`} style={{ animationDelay: `${0.2 + i * 0.15}s` }}>
                <div className={`w-16 h-16 rounded-2xl ${item.iconBg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon className={`w-8 h-8 ${item.iconColor}`} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-500 mb-6">{item.pain}</p>
                <div className="pt-6 border-t border-gray-200/50">
                  <div className={`text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${item.color} mb-1`}>{item.stat}</div>
                  <div className="text-gray-400 text-sm">{item.statLabel}</div>
                </div>
              </div>
            ))}
          </div>

          <div className={`bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-8 border border-indigo-200 shadow-sm ${isVisible[1] ? "animate-slide-up delay-500" : "opacity-0"}`}>
            <h3 className="text-xl font-bold text-gray-900 mb-8 text-center">Our Research Approach</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: Users, label: "Customer Surveys", value: "10,000+", color: "bg-blue-100", iconColor: "text-blue-600" },
                { icon: BarChart3, label: "Data Analysis", value: "2M+ Points", color: "bg-purple-100", iconColor: "text-purple-600" },
                { icon: MessageCircle, label: "Interviews", value: "500+", color: "bg-pink-100", iconColor: "text-pink-600" },
                { icon: Globe, label: "Market Research", value: "15 Regions", color: "bg-indigo-100", iconColor: "text-indigo-600" },
              ].map((item, i) => (
                <div key={i} className="text-center p-4 rounded-2xl bg-white hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
                  <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center mx-auto mb-3`}>
                    <item.icon className={`w-6 h-6 ${item.iconColor}`} />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">{item.value}</div>
                  <div className="text-gray-500 text-sm">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 2 - Identify Local Brands (discovery vibe) */}
      <section ref={setSectionRef(2)} className="snap-section min-h-screen flex items-center justify-center relative py-20 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        {/* Animated leaves and checkmarks */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <Leaf className="absolute top-16 left-16 w-12 h-12 text-emerald-300/40 animate-float" />
          <CheckCircle2 className="absolute bottom-16 right-16 w-12 h-12 text-teal-300/40 animate-pulse" />
        </div>
        <div className="w-full max-w-7xl px-6 relative z-10">
          <div className={`text-center mb-16 ${isVisible[2] ? "animate-slide-up" : "opacity-0"}`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 text-gray-700 text-sm mb-6 shadow-sm">
              <Search className="w-4 h-4" />
              Step 2 of 5
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">Identify Local Brands</h2>
            <p className="text-gray-500 text-xl max-w-2xl mx-auto">Finding quality brands with great products that need support and wider visibility</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { icon: Leaf, title: "Organic Farms", sub: "Fresh Produce", need: "Needs wider reach", count: "150+ Partners", bgColor: "bg-gradient-to-br from-green-50 to-emerald-50", borderColor: "border-green-200", iconBg: "bg-green-100", iconColor: "text-green-600" },
              { icon: Package, title: "Artisan Makers", sub: "Handcrafted Goods", need: "Limited visibility", count: "80+ Creators", bgColor: "bg-gradient-to-br from-amber-50 to-orange-50", borderColor: "border-amber-200", iconBg: "bg-amber-100", iconColor: "text-amber-600" },
              { icon: Heart, title: "Health Foods", sub: "Nutrition & Wellness", need: "Market entry help", count: "200+ Products", bgColor: "bg-gradient-to-br from-rose-50 to-pink-50", borderColor: "border-rose-200", iconBg: "bg-rose-100", iconColor: "text-rose-600" },
              { icon: Building2, title: "Eco Brands", sub: "Sustainable Living", need: "Budget constraints", count: "120+ Brands", bgColor: "bg-gradient-to-br from-teal-50 to-cyan-50", borderColor: "border-teal-200", iconBg: "bg-teal-100", iconColor: "text-teal-600" },
            ].map((brand, i) => (
              <div key={i} className={`group relative p-6 rounded-3xl ${brand.bgColor} border ${brand.borderColor} hover:shadow-xl transition-all duration-500 hover:-translate-y-0.5 ${isVisible[2] ? "animate-scale-in" : "opacity-0"}`} style={{ animationDelay: `${0.2 + i * 0.1}s` }}>
                <div className={`w-14 h-14 rounded-2xl ${brand.iconBg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <brand.icon className={`w-7 h-7 ${brand.iconColor}`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{brand.title}</h3>
                <p className="text-gray-400 text-sm mb-4">{brand.sub}</p>
                <div className="flex items-center gap-2 text-gray-700 font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm">{brand.count}</span>
                </div>
              </div>
            ))}
          </div>

          <div className={`bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-8 border border-emerald-200 shadow-sm ${isVisible[2] ? "animate-slide-up delay-500" : "opacity-0"}`}>
            <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Our Rigorous Selection Process</h3>
            <div className="flex flex-wrap justify-center gap-4">
              {[
                { step: "Quality Verification", color: "from-blue-500 to-indigo-600" },
                { step: "Ethical Sourcing Check", color: "from-green-500 to-emerald-600" },
                { step: "Price Analysis", color: "from-purple-500 to-violet-600" },
                { step: "Customer Demand Match", color: "from-orange-500 to-amber-600" },
                { step: "Sustainability Audit", color: "from-teal-500 to-cyan-600" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
                  <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${item.color} text-white text-xs flex items-center justify-center font-bold`}>{i + 1}</div>
                  <span className="text-gray-700 font-medium">{item.step}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={`mt-8 text-center ${isVisible[2] ? "animate-slide-up delay-700" : "opacity-0"}`}>
            <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-white border border-gray-200 shadow-sm">
              <Lightbulb className="w-6 h-6 text-gray-700" />
              <p className="text-gray-700"><span className="font-bold text-[#ff5f00]">Perfect Alignment:</span> These brands offer exactly what users need, but lack the platform to reach them</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3 - Strategic Collaboration (handshake motif) */}
      <section ref={setSectionRef(3)} className="snap-section min-h-screen flex items-center justify-center relative py-20 bg-gradient-to-br from-pink-50 via-rose-50 to-red-50">
        {/* Animated handshake icons */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <Handshake className="absolute top-10 left-24 w-16 h-16 text-rose-300/40 animate-float" />
          <Users className="absolute bottom-16 right-24 w-16 h-16 text-pink-300/40 animate-pulse" />
        </div>
        <div className="w-full max-w-7xl px-6 text-center relative z-10">
          <div className={`mb-10 ${isVisible[3] ? "animate-slide-up" : "opacity-0"}`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 text-gray-700 text-sm mb-6 shadow-sm">
              <Handshake className="w-4 h-4" />
              Step 3 of 5
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">Strategic Collaboration</h2>
            <p className="text-gray-500 text-xl max-w-2xl mx-auto">Our brand and finance teams work together to create win-win partnerships</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Win-Win Deals", icon: Handshake, bgColors: "from-blue-50 to-cyan-50", borderColors: "border-blue-200", textColors: "text-blue-700", iconBg: "bg-blue-100" },
              { label: "Long-Term Support", icon: Users, bgColors: "from-emerald-50 to-teal-50", borderColors: "border-emerald-200", textColors: "text-emerald-700", iconBg: "bg-emerald-100" },
              { label: "Exclusive Offers", icon: BadgePercent, bgColors: "from-purple-50 to-violet-50", borderColors: "border-purple-200", textColors: "text-purple-700", iconBg: "bg-purple-100" },
              { label: "Better Margins", icon: TrendingUp, bgColors: "from-orange-50 to-amber-50", borderColors: "border-orange-200", textColors: "text-orange-700", iconBg: "bg-orange-100" },
            ].map((item, i) => (
              <div key={i} className={`rounded-3xl bg-gradient-to-br ${item.bgColors} border ${item.borderColors} p-6 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group`}>
                <div className={`w-12 h-12 rounded-xl ${item.iconBg} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                  <item.icon className={`w-6 h-6 ${item.textColors}`} />
                </div>
                <div className={`${item.textColors} font-semibold`}>{item.label}</div>
                <p className="text-gray-500 text-sm mt-1">We negotiate value that converts to real savings.</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4 - Unlocking Extra Discounts (value burst) */}
      <section ref={setSectionRef(4)} className="snap-section min-h-screen flex items-center justify-center relative py-20 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
        {/* Animated percent and trending icons */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <BadgePercent className="absolute top-12 right-16 w-14 h-14 text-amber-400/40 animate-float" />
          <TrendingUp className="absolute bottom-16 left-20 w-16 h-16 text-orange-400/40 animate-pulse" />
        </div>
        <div className="w-full max-w-5xl px-6 text-center relative z-10">
          <div className={`mb-10 ${isVisible[4] ? "animate-slide-up" : "opacity-0"}`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 text-gray-700 text-sm mb-6 shadow-sm">
              <TrendingUp className="w-4 h-4" />
              Step 4 of 5
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">Unlock Extra Discounts</h2>
            <p className="text-gray-500 text-xl max-w-2xl mx-auto">Partnerships and support unlock offers beyond official sales</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { text: "Bulk Purchasing", color: "from-blue-500 to-indigo-600", bgColor: "bg-blue-50", textColor: "text-blue-700" },
              { text: "Co-Marketing", color: "from-purple-500 to-violet-600", bgColor: "bg-purple-50", textColor: "text-purple-700" },
              { text: "Direct Sourcing", color: "from-green-500 to-emerald-600", bgColor: "bg-green-50", textColor: "text-green-700" },
              { text: "Inventory Support", color: "from-orange-500 to-amber-600", bgColor: "bg-orange-50", textColor: "text-orange-700" },
            ].map((chip, i) => (
              <span key={i} className={`px-4 py-2 rounded-2xl ${chip.bgColor} ${chip.textColor} border border-gray-200 text-sm font-medium shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5`}>{chip.text}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5 - Share the Savings (coin transfer animation) */}
      <section ref={setSectionRef(5)} className="snap-section min-h-screen flex items-center justify-center relative py-20 bg-gradient-to-br from-cyan-50 via-sky-50 to-blue-50">
        {/* Animated coin moving from left person to right person */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center">
          {/* left person */}
          <div className="absolute left-[12%] md:left-[18%] top-1/2 -translate-y-1/2 flex items-center gap-2 text-gray-400">
            <User className="w-10 h-10" />
          </div>
          {/* right person */}
          <div className="absolute right-[12%] md:right-[18%] top-1/2 -translate-y-1/2 flex items-center gap-2 text-gray-400">
            <User className="w-10 h-10" />
          </div>
          {/* moving coin */}
          <div
            className="absolute top-1/2 -translate-y-1/2"
            style={{
              left: `${12 + ((shareAnimTick % 100) / 100) * 76}%`,
              transition: 'left 1s ease-in-out',
            }}
          >
            <div className="w-8 h-8 rounded-full bg-yellow-400/90 border border-yellow-300 shadow-md flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
        <div className="w-full max-w-5xl px-6 text-center relative z-10">
          <div className={`mb-10 ${isVisible[5] ? "animate-slide-up" : "opacity-0"}`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 text-gray-700 text-sm mb-6 shadow-sm">
              <DollarSign className="w-4 h-4" />
              Step 5 of 5
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">Share the Savings</h2>
            <p className="text-gray-500 text-xl max-w-2xl mx-auto">We pass the maximum possible savings directly to you</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { label: "Official Price", value: "Rs. 2,000", bgColor: "bg-gray-50", borderColor: "border-gray-200", textColor: "text-gray-700" },
              { label: "Selling Price", value: "Rs. 1,800", bgColor: "bg-blue-50", borderColor: "border-blue-200", textColor: "text-blue-700" },
              { label: "Our Price", value: "Rs. 1,620", bgColor: "bg-gradient-to-br from-green-50 to-emerald-50", borderColor: "border-green-200", textColor: "text-green-700", valueColor: "text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600" },
            ].map((p, i) => (
              <div key={i} className={`rounded-3xl ${p.bgColor} border ${p.borderColor} p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5`}>
                <div className={`${p.textColor} text-sm`}>{p.label}</div>
                <div className={`text-2xl font-bold ${p.valueColor || p.textColor}`}>{p.value}</div>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <Button size="lg" className="bg-gray-900 text-white hover:bg-gray-800 font-semibold px-10 py-7 rounded-2xl text-lg shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all animate-pulse">
              Start Shopping <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default function StoryPage() {
  return (
    <>
      <Header />
      <StoryContent />
      <Footer />
    </>
  )
}
