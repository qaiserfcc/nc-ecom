"use client"

import { useRef, useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, useScroll, useSpring, useTransform, AnimatePresence, useInView } from "framer-motion"
import { 
  Search, Users, Handshake, TrendingDown, Gift, 
  ChevronDown, ChevronUp, ArrowRight, ArrowLeft,
  Heart, ShoppingBag, Leaf, DollarSign, Target,
  MessageCircle, Building2, Briefcase, PiggyBank,
  Sparkles, Check, Star, CircleDot
} from "lucide-react"
import Header from "@/components/header"
import { Button } from "@/components/ui/button"

// Story sections data
const storyData = [
  {
    id: 1,
    title: "Study User Needs",
    subtitle: "Understanding What Matters Most",
    description: "We deeply analyze user shopping patterns, budget constraints, and product preferences to identify exactly where savings matter most.",
    color: "from-blue-500 to-cyan-500",
    bgGradient: "from-blue-50 to-cyan-50",
  },
  {
    id: 2,
    title: "Identify Local Brands That Need Support",
    subtitle: "Finding Hidden Gems",
    description: "We discover amazing local and organic brands that offer quality products but struggle with visibility and market reach.",
    color: "from-green-500 to-emerald-500",
    bgGradient: "from-green-50 to-emerald-50",
  },
  {
    id: 3,
    title: "Brand & Finance Team Collaboration",
    subtitle: "Strategic Partnership",
    description: "Our finance and brand teams work together to create win-win deals that benefit both consumers and local businesses.",
    color: "from-purple-500 to-pink-500",
    bgGradient: "from-purple-50 to-pink-50",
  },
  {
    id: 4,
    title: "Unlocking Extra Discounts",
    subtitle: "Beyond Official Sales",
    description: "Through strategic partnerships and financial support, we unlock exclusive discounts that go beyond what brands offer elsewhere.",
    color: "from-orange-500 to-red-500",
    bgGradient: "from-orange-50 to-red-50",
  },
  {
    id: 5,
    title: "Sharing Savings with Users",
    subtitle: "Your Benefit, Our Mission",
    description: "All the extra savings go directly to you. Every purchase on Namecheap means more money in your pocket.",
    color: "from-yellow-500 to-orange-500",
    bgGradient: "from-yellow-50 to-orange-50",
  },
]

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
}

const fadeInLeft = {
  hidden: { opacity: 0, x: -80 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeOut" } }
}

const fadeInRight = {
  hidden: { opacity: 0, x: 80 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeOut" } }
}

const fadeInBottom = {
  hidden: { opacity: 0, y: 80 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: "easeOut" } }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
}

// Section 1: Study User Needs
function Section1StudyUserNeeds({ isActive }: { isActive: boolean }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: false, amount: 0.3 })

  const userPersonas = [
    { icon: Users, label: "Budget-Conscious", color: "text-blue-500", painPoint: "Finding authentic deals" },
    { icon: Heart, label: "Health-Focused", color: "text-red-500", painPoint: "Organic affordability" },
    { icon: ShoppingBag, label: "Smart Shoppers", color: "text-green-500", painPoint: "Time & savings" },
  ]

  return (
    <section
      ref={ref}
      className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-blue-50 to-cyan-50"
    >
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-20 left-10 w-96 h-96 bg-blue-300 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.15, 0.1]
          }}
          transition={{ duration: 10, repeat: Infinity, delay: 1 }}
          className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-300 rounded-full blur-3xl"
        />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <motion.div
              variants={scaleIn}
              className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full mb-6 shadow-lg"
            >
              <CircleDot className="w-5 h-5 text-blue-500 animate-pulse" />
              <span className="font-bold text-gray-700">Step 1 of 5</span>
            </motion.div>
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
              Study <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">User Needs</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Understanding what matters most to our customers
            </p>
          </motion.div>

          {/* User Personas Grid - Animate from LEFT */}
          <motion.div
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12"
          >
            {userPersonas.map((persona, index) => {
              const Icon = persona.icon
              return (
                <motion.div
                  key={index}
                  variants={fadeInLeft}
                  whileHover={{ scale: 1.05, y: -10 }}
                  className="bg-white/80 backdrop-blur-xl border-2 border-blue-100 rounded-3xl p-8 text-center hover:shadow-2xl transition-shadow"
                >
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                    }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                    className={`inline-flex p-6 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 mb-6 ${persona.color}`}
                  >
                    <Icon className="w-10 h-10" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{persona.label}</h3>
                  <div className="bg-blue-50 rounded-xl p-4">
                    <p className="text-sm font-semibold text-blue-600 mb-2">Pain Point:</p>
                    <p className="text-gray-700">{persona.painPoint}</p>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>

          {/* Data Insights - Bottom animation */}
          <motion.div
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={fadeInBottom}
            className="bg-white/90 backdrop-blur-xl border-2 border-blue-200 rounded-3xl p-8 md:p-10"
          >
            <div className="flex items-center gap-3 mb-6">
              <Target className="w-8 h-8 text-blue-600" />
              <h3 className="text-2xl font-bold text-gray-900">Key Insights</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: "Want better prices", value: "89%" },
                { label: "Trust organic brands", value: "76%" },
                { label: "Compare before buying", value: "92%" },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={isInView ? { scale: 1 } : { scale: 0 }}
                  transition={{ delay: 0.5 + i * 0.2, type: "spring" }}
                  className="text-center"
                >
                  <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600 mb-2">
                    {stat.value}
                  </p>
                  <p className="text-gray-700 font-medium">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// Section 2: Identify Local Brands
function Section2IdentifyLocalBrands({ isActive }: { isActive: boolean }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: false, amount: 0.3 })

  const brands = [
    { name: "Organic Farms", category: "Fresh Produce", icon: Leaf, status: "Needs reach" },
    { name: "Local Artisans", category: "Handmade Goods", icon: Heart, status: "Limited visibility" },
    { name: "Eco Products", category: "Sustainable Living", icon: Building2, status: "Budget constraints" },
    { name: "Health Foods", category: "Nutrition", icon: Sparkles, status: "Market entry" },
  ]

  return (
    <section
      ref={ref}
      className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50"
    >
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            x: [0, 50, 0],
            y: [0, 30, 0],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-1/4 right-10 w-96 h-96 bg-green-300 rounded-full blur-3xl"
        />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <motion.div
              variants={scaleIn}
              className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full mb-6 shadow-lg"
            >
              <CircleDot className="w-5 h-5 text-green-500 animate-pulse" />
              <span className="font-bold text-gray-700">Step 2 of 5</span>
            </motion.div>
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
              Identify <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">Local Brands</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Finding quality brands that need support and visibility
            </p>
          </motion.div>

          {/* Brand Cards - Animate from RIGHT */}
          <motion.div
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-12"
          >
            {brands.map((brand, index) => {
              const Icon = brand.icon
              return (
                <motion.div
                  key={index}
                  variants={fadeInRight}
                  whileHover={{ scale: 1.03, x: 10 }}
                  className="bg-white/80 backdrop-blur-xl border-2 border-green-100 rounded-3xl p-8 hover:shadow-2xl transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl">
                          <Icon className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{brand.name}</h3>
                          <p className="text-sm text-gray-600">{brand.category}</p>
                        </div>
                      </div>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2">
                        <p className="text-sm font-semibold text-yellow-700">🔍 {brand.status}</p>
                      </div>
                    </div>
                    <motion.div
                      animate={{ rotate: [0, 10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Star className="w-6 h-6 text-green-500 fill-green-500" />
                    </motion.div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>

          {/* Alignment Message */}
          <motion.div
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={fadeInBottom}
            className="bg-white/90 backdrop-blur-xl border-2 border-green-200 rounded-3xl p-8 text-center"
          >
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <ArrowRight className="w-8 h-8 text-gray-400" />
              <div className="p-3 bg-green-100 rounded-full">
                <Building2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Perfect Alignment</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              These brands offer exactly what our users need, but lack the platform and resources to reach them effectively.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// Section 3: Brand & Finance Collaboration
function Section3Collaboration({ isActive }: { isActive: boolean }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: false, amount: 0.3 })

  const collaborationSteps = [
    { icon: MessageCircle, label: "Initial Contact", color: "from-purple-500 to-pink-500" },
    { icon: Briefcase, label: "Needs Analysis", color: "from-pink-500 to-red-500" },
    { icon: DollarSign, label: "Financial Planning", color: "from-red-500 to-orange-500" },
    { icon: Handshake, label: "Partnership Deal", color: "from-orange-500 to-yellow-500" },
  ]

  return (
    <section
      ref={ref}
      className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50"
    >
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 12, repeat: Infinity }}
          className="absolute top-1/3 left-1/4 w-96 h-96 bg-purple-300 rounded-full blur-3xl"
        />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <motion.div
              variants={scaleIn}
              className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full mb-6 shadow-lg"
            >
              <CircleDot className="w-5 h-5 text-purple-500 animate-pulse" />
              <span className="font-bold text-gray-700">Step 3 of 5</span>
            </motion.div>
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Strategic</span> Collaboration
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our brand and finance teams work together to create win-win partnerships
            </p>
          </motion.div>

          {/* Collaboration Flow - Animate from BOTTOM with stagger */}
          <motion.div
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={staggerContainer}
            className="relative mb-12"
          >
            {/* Connection Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none hidden md:block" style={{ zIndex: 0 }}>
              <motion.path
                d="M 25% 50% Q 37.5% 30% 50% 50% T 75% 50%"
                fill="none"
                stroke="url(#purpleGradient)"
                strokeWidth="3"
                strokeDasharray="10 5"
                initial={{ pathLength: 0 }}
                animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
                transition={{ duration: 2, delay: 0.5 }}
              />
              <defs>
                <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
            </svg>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8 relative" style={{ zIndex: 1 }}>
              {collaborationSteps.map((step, index) => {
                const Icon = step.icon
                return (
                  <motion.div
                    key={index}
                    variants={fadeInBottom}
                    whileHover={{ scale: 1.1, y: -10 }}
                    className="flex flex-col items-center text-center"
                  >
                    <motion.div
                      animate={{ 
                        y: [0, -10, 0],
                      }}
                      transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                      className={`p-6 rounded-2xl bg-gradient-to-br ${step.color} text-white shadow-2xl mb-4`}
                    >
                      <Icon className="w-10 h-10" />
                    </motion.div>
                    <h4 className="font-bold text-gray-900 text-lg">{step.label}</h4>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

          {/* Meeting Scene */}
          <motion.div
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={fadeInUp}
            className="bg-white/90 backdrop-blur-xl border-2 border-purple-200 rounded-3xl p-8 md:p-12"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              <motion.div
                variants={scaleIn}
                className="text-center"
              >
                <div className="inline-flex p-6 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full mb-4">
                  <Building2 className="w-12 h-12 text-blue-600" />
                </div>
                <h4 className="font-bold text-gray-900 text-lg">Brand Team</h4>
                <p className="text-sm text-gray-600">Relationship & Quality</p>
              </motion.div>

              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-center"
              >
                <div className="inline-flex p-6 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full">
                  <Handshake className="w-12 h-12 text-purple-600" />
                </div>
              </motion.div>

              <motion.div
                variants={scaleIn}
                className="text-center"
              >
                <div className="inline-flex p-6 bg-gradient-to-br from-green-100 to-green-200 rounded-full mb-4">
                  <DollarSign className="w-12 h-12 text-green-600" />
                </div>
                <h4 className="font-bold text-gray-900 text-lg">Finance Team</h4>
                <p className="text-sm text-gray-600">Deals & Support</p>
              </motion.div>
            </div>

            <motion.div
              variants={fadeInUp}
              className="mt-8 text-center"
            >
              <p className="text-gray-700 text-lg font-medium">
                Together, we create partnerships that benefit everyone: brands get support and visibility, customers get better prices.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// Section 4: Unlocking Extra Discounts
function Section4UnlockingDiscounts({ isActive }: { isActive: boolean }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: false, amount: 0.3 })
  const [showExtra, setShowExtra] = useState(false)

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => setShowExtra(true), 1000)
      return () => clearTimeout(timer)
    } else {
      setShowExtra(false)
    }
  }, [isInView])

  return (
    <section
      ref={ref}
      className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-orange-50 to-red-50"
    >
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.15, 0.25, 0.15]
          }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-300 rounded-full blur-3xl"
        />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <motion.div
              variants={scaleIn}
              className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full mb-6 shadow-lg"
            >
              <CircleDot className="w-5 h-5 text-orange-500 animate-pulse" />
              <span className="font-bold text-gray-700">Step 4 of 5</span>
            </motion.div>
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
              Unlocking <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">Extra Discounts</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Going beyond official sales with strategic financial support
            </p>
          </motion.div>

          {/* Discount Transformation */}
          <motion.div
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={fadeInUp}
            className="max-w-4xl mx-auto mb-12"
          >
            <div className="bg-white/90 backdrop-blur-xl border-2 border-orange-200 rounded-3xl p-8 md:p-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                {/* Official Discount */}
                <motion.div
                  variants={fadeInLeft}
                  className="text-center"
                >
                  <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl p-8 mb-4">
                    <TrendingDown className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Official Sale</h3>
                    <div className="text-5xl font-bold text-gray-700">15%</div>
                    <p className="text-sm text-gray-600 mt-2">Brand's standard discount</p>
                  </div>
                </motion.div>

                {/* Arrow/Plus */}
                <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center justify-center">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-6xl font-bold text-orange-500"
                  >
                    +
                  </motion.div>
                </div>

                {/* Extra Discount */}
                <AnimatePresence>
                  {showExtra && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5, x: 50 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ type: "spring", duration: 0.8 }}
                      className="text-center"
                    >
                      <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl p-8 mb-4 text-white shadow-2xl">
                        <Gift className="w-12 h-12 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold mb-2">Namecheap Extra</h3>
                        <div className="text-5xl font-bold">+10%</div>
                        <p className="text-sm mt-2 opacity-90">Our exclusive discount</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Total Savings */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={showExtra ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ delay: 0.5 }}
                className="mt-8 text-center"
              >
                <div className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-full text-2xl font-bold shadow-xl">
                  <Sparkles className="w-6 h-6" />
                  Total: 25% OFF
                  <Sparkles className="w-6 h-6" />
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* How It Works */}
          <motion.div
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={fadeInBottom}
            className="bg-white/80 backdrop-blur-xl border-2 border-orange-100 rounded-3xl p-8"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">How We Do It</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: PiggyBank, label: "Financial Support", desc: "We invest in brand growth" },
                { icon: Handshake, label: "Bulk Agreements", desc: "Volume-based partnerships" },
                { icon: TrendingDown, label: "Cost Efficiency", desc: "Optimized supply chain" },
              ].map((item, i) => {
                const Icon = item.icon
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ delay: 0.6 + i * 0.2 }}
                    className="text-center"
                  >
                    <div className="inline-flex p-4 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl mb-3">
                      <Icon className="w-8 h-8 text-orange-600" />
                    </div>
                    <h4 className="font-bold text-gray-900 mb-1">{item.label}</h4>
                    <p className="text-sm text-gray-600">{item.desc}</p>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// Section 5: Sharing Savings
function Section5SharingSavings({ isActive }: { isActive: boolean }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: false, amount: 0.3 })
  const [celebrate, setCelebrate] = useState(false)

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => setCelebrate(true), 500)
      return () => clearTimeout(timer)
    } else {
      setCelebrate(false)
    }
  }, [isInView])

  return (
    <section
      ref={ref}
      className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50"
    >
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {celebrate && typeof window !== "undefined" && (
          <>
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ y: -100, x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1000), opacity: 1 }}
                animate={{ 
                  y: (typeof window !== "undefined" ? window.innerHeight : 800) + 100,
                  rotate: Math.random() * 360,
                  opacity: 0
                }}
                transition={{ 
                  duration: Math.random() * 3 + 2,
                  delay: Math.random() * 0.5,
                  repeat: Infinity
                }}
                className="absolute w-3 h-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full"
              />
            ))}
          </>
        )}
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <motion.div
              variants={scaleIn}
              className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full mb-6 shadow-lg"
            >
              <CircleDot className="w-5 h-5 text-yellow-500 animate-pulse" />
              <span className="font-bold text-gray-700">Step 5 of 5</span>
            </motion.div>
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600">Sharing</span> the Savings
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Every extra penny saved goes directly to you
            </p>
          </motion.div>

          {/* Celebration Animation */}
          <motion.div
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={fadeInUp}
            className="mb-12"
          >
            <div className="relative max-w-3xl mx-auto">
              {/* Discount Badges Floating to Users */}
              <div className="flex justify-between items-center mb-8">
                <motion.div
                  animate={celebrate ? {
                    scale: [1, 1.2, 1],
                    rotate: [0, 360],
                  } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="p-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-full text-white shadow-2xl"
                >
                  <Gift className="w-16 h-16" />
                </motion.div>

                {/* Animated arrows/badges moving right */}
                <div className="flex-1 flex justify-center gap-4">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={celebrate ? {
                        x: [0, 100, 200],
                        opacity: [0, 1, 0]
                      } : {}}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.3
                      }}
                      className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center text-white font-bold shadow-lg"
                    >
                      $
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  animate={celebrate ? {
                    scale: [1, 1.1, 1],
                  } : {}}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="p-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full text-white shadow-2xl"
                >
                  <Users className="w-16 h-16" />
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={celebrate ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ delay: 0.5 }}
                className="bg-white/90 backdrop-blur-xl border-2 border-orange-200 rounded-3xl p-8 md:p-10 text-center"
              >
                <div className="flex items-center justify-center gap-3 mb-6">
                  <Check className="w-8 h-8 text-green-500" />
                  <h3 className="text-3xl font-bold text-gray-900">You Save More!</h3>
                  <Check className="w-8 h-8 text-green-500" />
                </div>
                <p className="text-lg text-gray-700 mb-6">
                  Our entire business model is built around passing maximum savings to you. No hidden fees, no markups—just honest prices and extra discounts.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { icon: Heart, label: "100% Transparent", color: "from-red-500 to-pink-500" },
                    { icon: ShoppingBag, label: "Better Prices", color: "from-orange-500 to-yellow-500" },
                    { icon: Sparkles, label: "Quality Guaranteed", color: "from-purple-500 to-pink-500" },
                  ].map((item, i) => {
                    const Icon = item.icon
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={celebrate ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                        transition={{ delay: 0.7 + i * 0.2 }}
                        className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-6"
                      >
                        <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${item.color} text-white mb-3`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <p className="font-bold text-gray-900">{item.label}</p>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Strong CTA */}
          <motion.div
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={fadeInBottom}
            className="text-center"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block"
            >
              <Link href="/shop">
                <Button className="bg-gradient-to-r from-orange-600 via-red-600 to-orange-600 hover:from-orange-700 hover:via-red-700 hover:to-orange-700 text-white px-12 py-6 text-xl font-bold rounded-full shadow-2xl">
                  <Sparkles className="w-6 h-6 mr-2" />
                  Start Saving with Namecheap
                  <ArrowRight className="w-6 h-6 ml-2" />
                </Button>
              </Link>
            </motion.div>
            <p className="text-gray-600 mt-6 text-lg">Join millions who are already saving on quality organic products</p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// Hero Section
function HeroSection({ scrollToSection }: { scrollToSection: (index: number) => void }) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-orange-50 via-red-50 to-orange-50">
      {/* Animated background elements */}
      <motion.div
        className="absolute top-20 right-1/4 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl"
        animate={{ y: [0, 100, 0], x: [0, 50, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute -bottom-20 -left-40 w-96 h-96 bg-red-200/20 rounded-full blur-3xl"
        animate={{ y: [0, -100, 0], x: [0, -50, 0] }}
        transition={{ duration: 10, repeat: Infinity, delay: 0.5 }}
      />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full mb-8 shadow-lg"
          >
            <Sparkles className="w-5 h-5 text-orange-600" />
            <span className="font-bold text-gray-700">The Namecheap Story</span>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight"
          >
            How We Deliver{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600 animate-pulse">
              Extra Discounts
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto"
          >
            Discover the journey from understanding your needs to delivering unbeatable savings on quality organic products
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => scrollToSection(0)}
              className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg"
            >
              Start the Journey
              <ChevronDown className="w-5 h-5 inline-block ml-2" />
            </motion.button>
            <Link href="/shop">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button variant="outline" className="border-2 border-orange-600 text-orange-600 hover:bg-orange-50 px-8 py-4 text-lg font-semibold rounded-full">
                  Shop Now
                </Button>
              </motion.div>
            </Link>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-gray-400"
          >
            <ChevronDown className="w-8 h-8 mx-auto" />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// Navigation Controls
function NavigationControls({ 
  currentSection, 
  totalSections, 
  onNavigate 
}: { 
  currentSection: number
  totalSections: number
  onNavigate: (direction: "prev" | "next") => void
}) {
  return (
    <>
      {/* Progress Dots - Desktop Right Side */}
      <div className="fixed right-8 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-4">
        {[...Array(totalSections)].map((_, index) => (
          <motion.div
            key={index}
            className={`w-3 h-3 rounded-full transition-all cursor-pointer ${
              currentSection === index
                ? "bg-orange-600 scale-150"
                : "bg-gray-300 hover:bg-orange-300"
            }`}
            whileHover={{ scale: 1.5 }}
          />
        ))}
      </div>

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 bg-white/90 backdrop-blur-xl border-2 border-orange-200 rounded-full px-6 py-4 shadow-2xl">
        <div className="flex items-center gap-6">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onNavigate("prev")}
            disabled={currentSection === 0}
            className={`p-2 rounded-full ${
              currentSection === 0
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600"
            }`}
          >
            <ChevronUp className="w-5 h-5" />
          </motion.button>

          <div className="text-center">
            <p className="text-sm font-bold text-gray-700">
              {currentSection + 1} / {totalSections}
            </p>
            <p className="text-xs text-gray-500">
              {storyData[currentSection]?.title || "Welcome"}
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onNavigate("next")}
            disabled={currentSection === totalSections - 1}
            className={`p-2 rounded-full ${
              currentSection === totalSections - 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600"
            }`}
          >
            <ChevronDown className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </>
  )
}

// Main Export
export default function NamecheapStoryPage() {
  const [currentSection, setCurrentSection] = useState(0)
  const sectionRefs = useRef<(HTMLElement | null)[]>([])
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })

  const totalSections = 6 // Hero + 5 story sections

  const scrollToSection = (index: number) => {
    const section = sectionRefs.current[index]
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  const handleNavigate = (direction: "prev" | "next") => {
    const newSection = direction === "prev" 
      ? Math.max(0, currentSection - 1)
      : Math.min(totalSections - 1, currentSection + 1)
    scrollToSection(newSection)
  }

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 2
      
      sectionRefs.current.forEach((section, index) => {
        if (section) {
          const { offsetTop, offsetHeight } = section
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setCurrentSection(index)
          }
        }
      })
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <>
      <Header />
      <motion.main className="relative bg-white" style={{ scrollBehavior: "smooth" }}>
        {/* Progress Bar */}
        <motion.div
          className="fixed top-0 left-0 right-0 h-1.5 md:h-2 bg-gradient-to-r from-orange-600 via-red-600 to-orange-600 origin-left z-50"
          style={{ scaleX }}
        />

        {/* Hero Section */}
        <div ref={(el) => { sectionRefs.current[0] = el }}>
          <HeroSection scrollToSection={scrollToSection} />
        </div>

        {/* Story Sections */}
        <div ref={(el) => { sectionRefs.current[1] = el }}>
          <Section1StudyUserNeeds isActive={currentSection === 1} />
        </div>

        <div ref={(el) => { sectionRefs.current[2] = el }}>
          <Section2IdentifyLocalBrands isActive={currentSection === 2} />
        </div>

        <div ref={(el) => { sectionRefs.current[3] = el }}>
          <Section3Collaboration isActive={currentSection === 3} />
        </div>

        <div ref={(el) => { sectionRefs.current[4] = el }}>
          <Section4UnlockingDiscounts isActive={currentSection === 4} />
        </div>

        <div ref={(el) => { sectionRefs.current[5] = el }}>
          <Section5SharingSavings isActive={currentSection === 5} />
        </div>

        {/* Navigation Controls */}
        <NavigationControls
          currentSection={currentSection}
          totalSections={totalSections}
          onNavigate={handleNavigate}
        />
      </motion.main>
    </>
  )
}
