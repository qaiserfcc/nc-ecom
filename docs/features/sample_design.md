global.css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

:root {
  /* Updated to bright white theme */
  --background: oklch(0.99 0 0);
  --foreground: oklch(0.15 0 0);
  --card: oklch(0.98 0 0);
  --card-foreground: oklch(0.15 0 0);
  --popover: oklch(0.99 0 0);
  --popover-foreground: oklch(0.15 0 0);
  --primary: oklch(0.65 0.2 45);
  --primary-foreground: oklch(1 0 0);
  --secondary: oklch(0.96 0 0);
  --secondary-foreground: oklch(0.15 0 0);
  --muted: oklch(0.94 0 0);
  --muted-foreground: oklch(0.45 0 0);
  --accent: oklch(0.65 0.2 45);
  --accent-foreground: oklch(1 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --destructive-foreground: oklch(0.577 0.245 27.325);
  --border: oklch(0.9 0 0);
  --input: oklch(0.9 0 0);
  --ring: oklch(0.65 0.2 45);
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
  --radius: 0.625rem;
  --sidebar: oklch(0.98 0 0);
  --sidebar-foreground: oklch(0.15 0 0);
  --sidebar-primary: oklch(0.65 0.2 45);
  --sidebar-primary-foreground: oklch(1 0 0);
  --sidebar-accent: oklch(0.96 0 0);
  --sidebar-accent-foreground: oklch(0.15 0 0);
  --sidebar-border: oklch(0.9 0 0);
  --sidebar-ring: oklch(0.65 0.2 45);
}

/* Remove dark mode overrides - keeping light theme only */

@theme inline {
  --font-sans: "Geist", "Geist Fallback";
  --font-mono: "Geist Mono", "Geist Mono Fallback";
  --font-serif: "DM Serif Display", "Georgia", "serif";
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}

/* Add snap scroll and animation styles */
html {
  scroll-snap-type: y mandatory;
  scroll-behavior: smooth;
}

.snap-section {
  scroll-snap-align: start;
  scroll-snap-stop: always;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

@keyframes pulse-glow {
  0%,
  100% {
    box-shadow: 0 0 20px rgba(255, 95, 0, 0.3);
  }
  50% {
    box-shadow: 0 0 40px rgba(255, 95, 0, 0.6);
  }
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slide-in-left {
  from {
    opacity: 0;
    transform: translateX(-60px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slide-in-right {
  from {
    opacity: 0;
    transform: translateX(60px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes bounce-slow {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-15px);
  }
}

@keyframes spin-slow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes draw-line {
  from {
    stroke-dashoffset: 1000;
  }
  to {
    stroke-dashoffset: 0;
  }
}

.animate-float {
  animation: float 4s ease-in-out infinite;
}
.animate-pulse-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}
.animate-slide-up {
  animation: slide-up 0.8s ease-out forwards;
}
.animate-slide-in-left {
  animation: slide-in-left 0.8s ease-out forwards;
}
.animate-slide-in-right {
  animation: slide-in-right 0.8s ease-out forwards;
}
.animate-scale-in {
  animation: scale-in 0.6s ease-out forwards;
}
.animate-bounce-slow {
  animation: bounce-slow 2s ease-in-out infinite;
}
.animate-spin-slow {
  animation: spin-slow 8s linear infinite;
}

.delay-100 {
  animation-delay: 0.1s;
}
.delay-200 {
  animation-delay: 0.2s;
}
.delay-300 {
  animation-delay: 0.3s;
}
.delay-400 {
  animation-delay: 0.4s;
}
.delay-500 {
  animation-delay: 0.5s;
}
.delay-600 {
  animation-delay: 0.6s;
}
.delay-700 {
  animation-delay: 0.7s;
}
.delay-800 {
  animation-delay: 0.8s;
}

.stagger > *:nth-child(1) {
  animation-delay: 0.1s;
}
.stagger > *:nth-child(2) {
  animation-delay: 0.2s;
}
.stagger > *:nth-child(3) {
  animation-delay: 0.3s;
}
.stagger > *:nth-child(4) {
  animation-delay: 0.4s;
}
.stagger > *:nth-child(5) {
  animation-delay: 0.5s;
}
.stagger > *:nth-child(6) {
  animation-delay: 0.6s;
}


Layout.tsx
import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono, DM_Serif_Display } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })
const _dmSerifDisplay = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
})

export const metadata: Metadata = {
  title: "Namecheap Extra Discount - The Story of How We Save You More",
  description:
    "Discover how Namecheap delivers extra discounts on quality organic products. From understanding your needs to strategic brand partnerships, see how we pass maximum savings to you.",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}


page.tsx
"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Suspense } from "react"
import {
  ChevronDown,
  ShoppingBag,
  Search,
  Leaf,
  Users,
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
  Zap,
  Gift,
  Star,
  Award,
  ThumbsUp,
  Truck,
  BadgePercent,
  CircleDollarSign,
  Building2,
  HeartHandshake,
  Lightbulb,
  BarChart3,
  Globe,
  MessageCircle,
} from "lucide-react"

function HomePageContent() {
  const [activeSection, setActiveSection] = useState(0)
  const [isVisible, setIsVisible] = useState<boolean[]>(Array(7).fill(false))
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const observers = sectionRefs.current.map((ref, index) => {
      if (!ref) return null

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(index)
              setIsVisible((prev) => {
                const newState = [...prev]
                newState[index] = true
                return newState
              })
            }
          })
        },
        { threshold: 0.5 },
      )

      observer.observe(ref)
      return observer
    })

    return () => {
      observers.forEach((observer) => observer?.disconnect())
    }
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
    { number: 6, label: "Join" },
  ]

  return (
    <div className="bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff5f00] to-[#ff8f40] flex items-center justify-center shadow-lg shadow-orange-200">
              <span className="text-white font-bold text-lg">N</span>
            </div>
            <span className="text-xl font-bold">
              <span className="text-[#ff5f00]">Namecheap</span>
              <span className="text-gray-400 text-sm ml-1 hidden sm:inline">Extra Discount</span>
            </span>
          </div>
          <div className="hidden lg:flex items-center gap-6 text-gray-500 text-sm font-medium">
            <a href="#" className="hover:text-[#ff5f00] transition-colors flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff5f00]"></span>
              Story
            </a>
            <a href="#" className="hover:text-[#ff5f00] transition-colors">
              Home
            </a>
            <a href="#" className="hover:text-[#ff5f00] transition-colors">
              Shop
            </a>
            <a href="#" className="hover:text-[#ff5f00] transition-colors">
              Quote
            </a>
            <a href="#" className="hover:text-[#ff5f00] transition-colors">
              Orders
            </a>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="text-gray-600 hover:text-[#ff5f00]">
            <MessageCircle className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Support</span>
          </Button>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-100 to-orange-50 border-2 border-[#ff5f00]/20 flex items-center justify-center text-[#ff5f00] text-sm font-bold">
            R
          </div>
        </div>
      </nav>

      {/* Progress Indicator */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col gap-2">
        {steps.map((step, i) => (
          <button
            key={i}
            onClick={() => sectionRefs.current[i]?.scrollIntoView({ behavior: "smooth" })}
            className="group flex items-center gap-3"
          >
            <span
              className={`text-xs font-medium transition-all duration-300 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 ${
                activeSection === i ? "text-[#ff5f00]" : "text-gray-400"
              }`}
            >
              {step.label}
            </span>
            <div
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                activeSection > i
                  ? "bg-[#ff5f00] scale-75"
                  : activeSection === i
                    ? "bg-[#ff5f00] scale-125 ring-4 ring-orange-100"
                    : "bg-gray-200 scale-75 group-hover:bg-gray-300"
              }`}
            />
          </button>
        ))}
      </div>

      {/* Section 0 - Hero */}
      <section
        ref={setSectionRef(0)}
        className="snap-section min-h-screen flex items-center justify-center relative overflow-hidden pt-20"
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-orange-100 rounded-full blur-3xl opacity-60 animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-yellow-100 rounded-full blur-3xl opacity-40 animate-float delay-200" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-orange-50 to-yellow-50 rounded-full blur-3xl opacity-50" />
        </div>

        <div className={`text-center px-6 max-w-5xl relative z-10 ${isVisible[0] ? "animate-slide-up" : "opacity-0"}`}>
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 text-[#ff5f00] text-sm mb-8 shadow-sm">
            <Sparkles className="w-4 h-4" />
            <span className="font-medium">Discover How We Save You More</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-gray-900 mb-6 leading-tight">
            The{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff5f00] to-[#ff8f40]">
              Namecheap
            </span>
            <br />
            <span className="text-gray-600">Extra Discount</span> Story
          </h1>

          <p className="text-xl md:text-2xl text-gray-500 mb-4 max-w-3xl mx-auto">
            How We Deliver Unbeatable Savings on Premium Organic Products
          </p>

          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-12">
            Scroll through our 5-step journey and discover the secret behind our extraordinary discounts that benefit
            both local brands and smart shoppers like you.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button
              size="lg"
              className="bg-gradient-to-r from-[#ff5f00] to-[#ff8f40] text-white hover:from-[#ff7f2a] hover:to-[#ffa050] font-semibold px-10 py-7 rounded-full text-lg shadow-xl shadow-orange-200 hover:shadow-2xl hover:shadow-orange-300 transition-all duration-300 hover:-translate-y-1"
              onClick={() => sectionRefs.current[1]?.scrollIntoView({ behavior: "smooth" })}
            >
              Start the Journey
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold px-10 py-7 rounded-full text-lg hover:border-[#ff5f00]/30 transition-all bg-transparent"
            >
              <ShoppingBag className="w-5 h-5 mr-2" />
              Shop Now
            </Button>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-3 stagger">
            {[
              { icon: Shield, text: "100% Authentic" },
              { icon: Leaf, text: "Certified Organic" },
              { icon: Truck, text: "Fast Delivery" },
              { icon: BadgePercent, text: "Extra 10% Off" },
            ].map((item, i) => (
              <div
                key={i}
                className={`flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-100 shadow-sm ${isVisible[0] ? "animate-scale-in" : "opacity-0"}`}
                style={{ animationDelay: `${0.5 + i * 0.1}s` }}
              >
                <item.icon className="w-4 h-4 text-[#ff5f00]" />
                <span className="text-gray-600 text-sm font-medium">{item.text}</span>
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

      {/* Section 1 - Study User Needs */}
      <section
        ref={setSectionRef(1)}
        className="snap-section min-h-screen flex items-center justify-center relative py-20 bg-gradient-to-b from-white to-orange-50/30"
      >
        <div className="w-full max-w-7xl px-6">
          <div className={`text-center mb-16 ${isVisible[1] ? "animate-slide-up" : "opacity-0"}`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#ff5f00] text-white text-sm mb-6 shadow-lg shadow-orange-200">
              <Target className="w-4 h-4" />
              Step 1 of 5
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">Study User Needs</h2>
            <p className="text-gray-500 text-xl max-w-2xl mx-auto">
              Understanding what matters most to our customers through deep research and analysis
            </p>
          </div>

          {/* User Personas */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              {
                icon: DollarSign,
                title: "Budget-Conscious Buyers",
                pain: "Finding authentic deals without compromising quality",
                stat: "89%",
                statLabel: "Want better prices",
                color: "from-green-500 to-emerald-600",
                bgColor: "bg-green-50",
                borderColor: "border-green-200",
              },
              {
                icon: Heart,
                title: "Health-Focused Families",
                pain: "Organic products at affordable prices for daily use",
                stat: "76%",
                statLabel: "Trust organic brands",
                color: "from-pink-500 to-rose-600",
                bgColor: "bg-pink-50",
                borderColor: "border-pink-200",
              },
              {
                icon: Clock,
                title: "Smart Time-Savers",
                pain: "Quick access to quality products without endless searching",
                stat: "92%",
                statLabel: "Compare before buying",
                color: "from-blue-500 to-indigo-600",
                bgColor: "bg-blue-50",
                borderColor: "border-blue-200",
              },
            ].map((item, i) => (
              <div
                key={i}
                className={`group relative p-8 rounded-3xl ${item.bgColor} border ${item.borderColor} hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 ${isVisible[1] ? "animate-slide-up" : "opacity-0"}`}
                style={{ animationDelay: `${0.2 + i * 0.15}s` }}
              >
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-500 mb-6">{item.pain}</p>
                <div className="pt-6 border-t border-gray-200/50">
                  <div
                    className={`text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${item.color} mb-1`}
                  >
                    {item.stat}
                  </div>
                  <div className="text-gray-400 text-sm">{item.statLabel}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Research Methods */}
          <div
            className={`bg-white rounded-3xl p-8 border border-gray-100 shadow-xl ${isVisible[1] ? "animate-slide-up delay-500" : "opacity-0"}`}
          >
            <h3 className="text-xl font-bold text-gray-900 mb-8 text-center">Our Research Approach</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: Users, label: "Customer Surveys", value: "10,000+" },
                { icon: BarChart3, label: "Data Analysis", value: "2M+ Points" },
                { icon: MessageCircle, label: "Interviews", value: "500+" },
                { icon: Globe, label: "Market Research", value: "15 Regions" },
              ].map((item, i) => (
                <div key={i} className="text-center p-4 rounded-2xl bg-gray-50 hover:bg-orange-50 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-[#ff5f00]/10 flex items-center justify-center mx-auto mb-3">
                    <item.icon className="w-6 h-6 text-[#ff5f00]" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">{item.value}</div>
                  <div className="text-gray-500 text-sm">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 2 - Identify Local Brands */}
      <section
        ref={setSectionRef(2)}
        className="snap-section min-h-screen flex items-center justify-center relative py-20 bg-white"
      >
        <div className="w-full max-w-7xl px-6">
          <div className={`text-center mb-16 ${isVisible[2] ? "animate-slide-up" : "opacity-0"}`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#ff5f00] text-white text-sm mb-6 shadow-lg shadow-orange-200">
              <Search className="w-4 h-4" />
              Step 2 of 5
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">Identify Local Brands</h2>
            <p className="text-gray-500 text-xl max-w-2xl mx-auto">
              Finding quality brands with great products that need support and wider visibility
            </p>
          </div>

          {/* Brand Categories */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              {
                icon: Leaf,
                title: "Organic Farms",
                sub: "Fresh Produce",
                need: "Needs wider reach",
                count: "150+ Partners",
                color: "green",
              },
              {
                icon: Package,
                title: "Artisan Makers",
                sub: "Handcrafted Goods",
                need: "Limited visibility",
                count: "80+ Creators",
                color: "amber",
              },
              {
                icon: Heart,
                title: "Health Foods",
                sub: "Nutrition & Wellness",
                need: "Market entry help",
                count: "200+ Products",
                color: "rose",
              },
              {
                icon: Building2,
                title: "Eco Brands",
                sub: "Sustainable Living",
                need: "Budget constraints",
                count: "120+ Brands",
                color: "teal",
              },
            ].map((brand, i) => (
              <div
                key={i}
                className={`group relative p-6 rounded-3xl bg-white border-2 border-gray-100 hover:border-[#ff5f00]/30 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 ${isVisible[2] ? "animate-scale-in" : "opacity-0"}`}
                style={{ animationDelay: `${0.2 + i * 0.1}s` }}
              >
                <div className="absolute -top-3 -right-3 px-3 py-1 rounded-full bg-[#ff5f00] text-white text-xs font-medium shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <Search className="w-3 h-3 inline mr-1" />
                  {brand.need}
                </div>
                <div
                  className={`w-14 h-14 rounded-2xl bg-${brand.color}-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <brand.icon className={`w-7 h-7 text-${brand.color}-600`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{brand.title}</h3>
                <p className="text-gray-400 text-sm mb-4">{brand.sub}</p>
                <div className="flex items-center gap-2 text-[#ff5f00] font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm">{brand.count}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Selection Process */}
          <div
            className={`bg-gradient-to-r from-orange-50 to-yellow-50 rounded-3xl p-8 border border-orange-100 ${isVisible[2] ? "animate-slide-up delay-500" : "opacity-0"}`}
          >
            <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Our Rigorous Selection Process</h3>
            <div className="flex flex-wrap justify-center gap-4">
              {[
                "Quality Verification",
                "Ethical Sourcing Check",
                "Price Analysis",
                "Customer Demand Match",
                "Sustainability Audit",
              ].map((step, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-5 py-3 rounded-full bg-white border border-orange-200 shadow-sm"
                >
                  <div className="w-6 h-6 rounded-full bg-[#ff5f00] text-white text-xs flex items-center justify-center font-bold">
                    {i + 1}
                  </div>
                  <span className="text-gray-700 font-medium">{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Perfect Alignment Message */}
          <div className={`mt-8 text-center ${isVisible[2] ? "animate-slide-up delay-700" : "opacity-0"}`}>
            <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-[#ff5f00]/5 border border-[#ff5f00]/20">
              <Lightbulb className="w-6 h-6 text-[#ff5f00]" />
              <p className="text-gray-700">
                <span className="font-bold text-[#ff5f00]">Perfect Alignment:</span> These brands offer exactly what
                users need, but lack the platform to reach them
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3 - Strategic Collaboration */}
      <section
        ref={setSectionRef(3)}
        className="snap-section min-h-screen flex items-center justify-center relative py-20 bg-gradient-to-b from-white to-blue-50/30"
      >
        <div className="w-full max-w-7xl px-6">
          <div className={`text-center mb-16 ${isVisible[3] ? "animate-slide-up" : "opacity-0"}`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#ff5f00] text-white text-sm mb-6 shadow-lg shadow-orange-200">
              <Handshake className="w-4 h-4" />
              Step 3 of 5
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">Strategic Collaboration</h2>
            <p className="text-gray-500 text-xl max-w-2xl mx-auto">
              Our brand and finance teams work together to create win-win partnerships
            </p>
          </div>

          {/* Process Flow */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {[
              { icon: MessageCircle, label: "Initial Contact" },
              { icon: Target, label: "Needs Analysis" },
              { icon: BarChart3, label: "Financial Planning" },
              { icon: Handshake, label: "Partnership Deal" },
            ].map((step, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 ${isVisible[3] ? "animate-slide-in-left" : "opacity-0"}`}
                style={{ animationDelay: `${0.3 + i * 0.15}s` }}
              >
                <div
                  className={`flex items-center gap-3 px-6 py-4 rounded-2xl transition-all duration-300 ${
                    i === 3
                      ? "bg-gradient-to-r from-[#ff5f00] to-[#ff8f40] text-white shadow-xl shadow-orange-200"
                      : "bg-white border border-gray-200 text-gray-700 hover:border-[#ff5f00]/30"
                  }`}
                >
                  <step.icon className="w-5 h-5" />
                  <span className="font-semibold">{step.label}</span>
                </div>
                {i < 3 && <ArrowRight className="w-5 h-5 text-gray-300 hidden md:block" />}
              </div>
            ))}
          </div>

          {/* Teams Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div
              className={`p-8 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 ${isVisible[3] ? "animate-slide-in-left delay-500" : "opacity-0"}`}
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-6 shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Brand Team</h3>
              <p className="text-gray-500 mb-6">Builds relationships and ensures product quality standards</p>
              <div className="space-y-3">
                {["Quality Assurance", "Brand Communication", "Product Curation"].map((task, i) => (
                  <div key={i} className="flex items-center gap-2 text-blue-700">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="font-medium">{task}</span>
                  </div>
                ))}
              </div>
            </div>

            <div
              className={`p-8 rounded-3xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 ${isVisible[3] ? "animate-slide-in-right delay-600" : "opacity-0"}`}
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-6 shadow-lg">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Finance Team</h3>
              <p className="text-gray-500 mb-6">Negotiates deals and provides financial support packages</p>
              <div className="space-y-3">
                {["Price Negotiation", "Financial Support", "Cost Optimization"].map((task, i) => (
                  <div key={i} className="flex items-center gap-2 text-green-700">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="font-medium">{task}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Result Banner */}
          <div
            className={`text-center p-8 rounded-3xl bg-white border border-gray-100 shadow-xl ${isVisible[3] ? "animate-scale-in delay-700" : "opacity-0"}`}
          >
            <HeartHandshake className="w-16 h-16 text-[#ff5f00] mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Win-Win Partnerships</h3>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">
              Together, we create partnerships that benefit everyone: brands get support and visibility, while customers
              get access to quality products at better prices.
            </p>
          </div>
        </div>
      </section>

      {/* Section 4 - Unlocking Extra Discounts */}
      <section
        ref={setSectionRef(4)}
        className="snap-section min-h-screen flex items-center justify-center relative py-20 bg-white"
      >
        <div className="w-full max-w-6xl px-6">
          <div className={`text-center mb-16 ${isVisible[4] ? "animate-slide-up" : "opacity-0"}`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#ff5f00] text-white text-sm mb-6 shadow-lg shadow-orange-200">
              <Zap className="w-4 h-4" />
              Step 4 of 5
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">Unlocking Extra Discounts</h2>
            <p className="text-gray-500 text-xl max-w-2xl mx-auto">
              Going beyond official sales with strategic financial support
            </p>
          </div>

          {/* Discount Visualization */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10 mb-16">
            <div
              className={`text-center p-10 rounded-3xl bg-gray-50 border border-gray-200 min-w-[220px] ${isVisible[4] ? "animate-slide-in-left delay-200" : "opacity-0"}`}
            >
              <div className="text-gray-400 text-sm mb-3 font-medium">Official Sale</div>
              <div className="text-6xl md:text-7xl font-bold text-gray-300 mb-2">15%</div>
              <div className="text-gray-400 text-sm">Brand&apos;s standard discount</div>
            </div>

            <div
              className={`text-5xl font-bold text-[#ff5f00] animate-pulse-glow rounded-full w-16 h-16 flex items-center justify-center bg-orange-50 ${isVisible[4] ? "animate-scale-in delay-400" : "opacity-0"}`}
            >
              +
            </div>

            <div
              className={`text-center p-10 rounded-3xl bg-gradient-to-br from-[#ff5f00]/10 to-[#ff8f40]/5 border-2 border-[#ff5f00]/30 min-w-[220px] shadow-2xl shadow-orange-100 ${isVisible[4] ? "animate-slide-in-right delay-500" : "opacity-0"}`}
            >
              <div className="text-[#ff5f00] text-sm mb-3 font-bold uppercase tracking-wide">Namecheap Extra</div>
              <div className="text-6xl md:text-7xl font-bold text-[#ff5f00] mb-2">10%</div>
              <div className="text-[#ff5f00]/70 text-sm">Our additional discount</div>
            </div>

            <div
              className={`text-5xl font-bold text-gray-300 ${isVisible[4] ? "animate-scale-in delay-600" : "opacity-0"}`}
            >
              =
            </div>

            <div
              className={`text-center p-10 rounded-3xl bg-gradient-to-br from-green-500 to-emerald-600 text-white min-w-[220px] shadow-2xl shadow-green-200 transform hover:scale-105 transition-transform ${isVisible[4] ? "animate-scale-in delay-700" : "opacity-0"}`}
            >
              <div className="text-white/80 text-sm mb-3 font-bold uppercase tracking-wide">Your Savings</div>
              <div className="text-6xl md:text-7xl font-bold mb-2">25%</div>
              <div className="text-white/80 text-sm">Total Discount!</div>
            </div>
          </div>

          {/* How We Do It */}
          <div
            className={`bg-gradient-to-r from-gray-50 to-orange-50/30 rounded-3xl p-8 border border-gray-100 ${isVisible[4] ? "animate-slide-up delay-800" : "opacity-0"}`}
          >
            <h3 className="text-xl font-bold text-gray-900 mb-8 text-center">How We Make It Possible</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: CircleDollarSign,
                  title: "Financial Support",
                  desc: "We invest in brand growth to negotiate better prices",
                },
                { icon: Package, title: "Bulk Agreements", desc: "Volume-based partnerships reduce per-unit costs" },
                { icon: TrendingUp, title: "Cost Efficiency", desc: "Optimized supply chain passes savings to you" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 p-6 rounded-2xl bg-white border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1"
                >
                  <div className="w-14 h-14 rounded-xl bg-[#ff5f00]/10 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-7 h-7 text-[#ff5f00]" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h4>
                    <p className="text-gray-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 5 - Sharing the Savings */}
      <section
        ref={setSectionRef(5)}
        className="snap-section min-h-screen flex items-center justify-center relative py-20 bg-gradient-to-b from-white to-green-50/30"
      >
        <div className="w-full max-w-6xl px-6">
          <div className={`text-center mb-12 ${isVisible[5] ? "animate-slide-up" : "opacity-0"}`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#ff5f00] text-white text-sm mb-6 shadow-lg shadow-orange-200">
              <Gift className="w-4 h-4" />
              Step 5 of 5
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">Sharing the Savings</h2>
            <p className="text-gray-500 text-xl max-w-2xl mx-auto">Every extra penny saved goes directly to you</p>
          </div>

          {/* Money Animation */}
          <div
            className={`flex justify-center gap-6 mb-12 ${isVisible[5] ? "animate-scale-in delay-200" : "opacity-0"}`}
          >
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-2xl md:text-3xl font-bold shadow-xl shadow-green-200 animate-bounce-slow"
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                $
              </div>
            ))}
          </div>

          {/* You Save More Message */}
          <div className={`text-center mb-12 ${isVisible[5] ? "animate-slide-up delay-400" : "opacity-0"}`}>
            <h3 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-600 mb-6">
              You Save More!
            </h3>
            <p className="text-gray-500 text-xl max-w-2xl mx-auto">
              Our entire business model is built around passing maximum savings to you. No hidden fees, no markups—just
              honest prices and extra discounts.
            </p>
          </div>

          {/* Trust Badges */}
          <div
            className={`flex flex-wrap justify-center gap-4 mb-12 ${isVisible[5] ? "animate-slide-up delay-500" : "opacity-0"}`}
          >
            {[
              { icon: Shield, text: "100% Transparent Pricing" },
              { icon: PiggyBank, text: "Guaranteed Better Prices" },
              { icon: Award, text: "Quality Certified" },
              { icon: ThumbsUp, text: "Customer Approved" },
            ].map((badge, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white border border-gray-100 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                  <badge.icon className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-gray-700 font-semibold">{badge.text}</span>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div
            className={`grid grid-cols-2 md:grid-cols-4 gap-6 ${isVisible[5] ? "animate-slide-up delay-600" : "opacity-0"}`}
          >
            {[
              { value: "$2.5M+", label: "Saved by Customers" },
              { value: "500K+", label: "Happy Shoppers" },
              { value: "550+", label: "Brand Partners" },
              { value: "25%", label: "Avg. Savings" },
            ].map((stat, i) => (
              <div key={i} className="text-center p-6 rounded-2xl bg-white border border-gray-100 shadow-sm">
                <div className="text-3xl md:text-4xl font-bold text-[#ff5f00] mb-2">{stat.value}</div>
                <div className="text-gray-500 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 6 - Final CTA */}
      <section
        ref={setSectionRef(6)}
        className="snap-section min-h-screen flex items-center justify-center relative py-20 bg-gradient-to-b from-orange-50/50 to-white"
      >
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-72 h-72 bg-orange-100 rounded-full blur-3xl opacity-50 animate-float" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-yellow-100 rounded-full blur-3xl opacity-30 animate-float delay-300" />
        </div>

        <div className="w-full max-w-4xl px-6 relative z-10">
          <div
            className={`text-center p-12 md:p-16 rounded-[2.5rem] bg-gradient-to-br from-[#ff5f00] to-[#ff8f40] shadow-2xl shadow-orange-200 ${isVisible[6] ? "animate-scale-in" : "opacity-0"}`}
          >
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-8 backdrop-blur-sm">
              <Star className="w-10 h-10 text-white" />
            </div>

            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Start Saving with Namecheap Today</h2>

            <p className="text-white/80 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
              Join millions of smart shoppers who are already enjoying premium organic products at unbeatable prices.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
              <Button
                size="lg"
                className="bg-white text-[#ff5f00] hover:bg-gray-100 font-bold px-10 py-7 rounded-full text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                Start Shopping Now
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white/30 text-white hover:bg-white/10 font-semibold px-10 py-7 rounded-full text-lg bg-transparent"
              >
                Learn More
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>

            {/* Social Proof */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-white/70">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-white/20 border-2 border-white/30" />
                  ))}
                </div>
                <span className="text-sm">500K+ Happy Customers</span>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="text-sm ml-1">4.9/5 Rating</span>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          <div
            className={`flex flex-wrap justify-center gap-6 mt-12 text-gray-400 text-sm ${isVisible[6] ? "animate-slide-up delay-300" : "opacity-0"}`}
          >
            <a href="#" className="hover:text-[#ff5f00] transition-colors">
              About Us
            </a>
            <a href="#" className="hover:text-[#ff5f00] transition-colors">
              Contact
            </a>
            <a href="#" className="hover:text-[#ff5f00] transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-[#ff5f00] transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <HomePageContent />
    </Suspense>
  )
}


Package.json
{
  "name": "my-v0-project",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint ."
  },
  "dependencies": {
    "@hookform/resolvers": "^3.10.0",
    "@radix-ui/react-accordion": "1.2.2",
    "@radix-ui/react-alert-dialog": "1.1.4",
    "@radix-ui/react-aspect-ratio": "1.1.1",
    "@radix-ui/react-avatar": "1.1.2",
    "@radix-ui/react-checkbox": "1.1.3",
    "@radix-ui/react-collapsible": "1.1.2",
    "@radix-ui/react-context-menu": "2.2.4",
    "@radix-ui/react-dialog": "1.1.4",
    "@radix-ui/react-dropdown-menu": "2.1.4",
    "@radix-ui/react-hover-card": "1.1.4",
    "@radix-ui/react-label": "2.1.1",
    "@radix-ui/react-menubar": "1.1.4",
    "@radix-ui/react-navigation-menu": "1.2.3",
    "@radix-ui/react-popover": "1.1.4",
    "@radix-ui/react-progress": "1.1.1",
    "@radix-ui/react-radio-group": "1.2.2",
    "@radix-ui/react-scroll-area": "1.2.2",
    "@radix-ui/react-select": "2.1.4",
    "@radix-ui/react-separator": "1.1.1",
    "@radix-ui/react-slider": "1.2.2",
    "@radix-ui/react-slot": "1.1.1",
    "@radix-ui/react-switch": "1.1.2",
    "@radix-ui/react-tabs": "1.1.2",
    "@radix-ui/react-toast": "1.2.4",
    "@radix-ui/react-toggle": "1.1.1",
    "@radix-ui/react-toggle-group": "1.1.1",
    "@radix-ui/react-tooltip": "1.1.6",
    "@vercel/analytics": "1.3.1",
    "autoprefixer": "^10.4.20",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cmdk": "1.0.4",
    "date-fns": "4.1.0",
    "embla-carousel-react": "8.5.1",
    "input-otp": "1.4.1",
    "lucide-react": "^0.454.0",
    "next": "16.0.3",
    "next-themes": "^0.4.6",
    "react": "19.2.0",
    "react-day-picker": "9.8.0",
    "react-dom": "19.2.0",
    "react-hook-form": "^7.60.0",
    "react-resizable-panels": "^2.1.7",
    "recharts": "2.15.4",
    "sonner": "^1.7.4",
    "tailwind-merge": "^3.3.1",
    "tailwindcss-animate": "^1.0.7",
    "vaul": "^0.9.9",
    "zod": "3.25.76"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.1.9",
    "@types/node": "^22",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "postcss": "^8.5",
    "tailwindcss": "^4.1.9",
    "tw-animate-css": "1.3.3",
    "typescript": "^5"
  }
}
