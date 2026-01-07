"use client"

import { useRef, type ReactElement } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, useScroll, useSpring, useTransform } from "framer-motion"
import { HandCoins, Gift, Leaf, Search, Users, type LucideIcon } from "lucide-react"
import Header from "@/components/header"
import { Button } from "@/components/ui/button"

const storySteps: { title: string; description: string; icon: LucideIcon; color: string }[] = [
  {
    title: "1. Study User Needs",
    description:
      "We dive deep into data to understand exactly what our community is looking for in their daily lives.",
    icon: Search,
    color: "bg-[#fff7ed]",
  },
  {
    title: "2. Supporting Local Brands",
    description: "We identify local organic brands that provide high-quality products but need a platform to grow.",
    icon: Leaf,
    color: "bg-[#fff2e5]",
  },
  {
    title: "3. Strategic Alignment",
    description: "Our Finance and Brand teams meet to bridge the gap between quality products and affordable pricing.",
    icon: Users,
    color: "bg-[#fff0e1]",
  },
  {
    title: "4. Empowering Through Finance",
    description: "By offering financial support to these brands, our finance team negotiates exclusive extra discounts.",
    icon: HandCoins,
    color: "bg-[#fff5eb]",
  },
  {
    title: "5. Sharing the Value",
    description: "Finally, we pass those extra savings directly to you. Premium organic quality at unbeatable prices.",
    icon: Gift,
    color: "bg-[#fff8f3]",
  },
]

const storyGraphics = [
  "/story/graphic-1.svg",
  "/story/graphic-2.svg",
  "/story/graphic-3.svg",
]

function InteractiveIcon({ icon }: { icon: ReactElement }) {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      whileInView={{ scale: 1, rotate: 0 }}
      viewport={{ once: false, amount: 0.8 }}
      whileHover={{
        scale: 1.2,
        rotate: 10,
        backgroundColor: "#fff7ed",
        transition: { type: "spring", stiffness: 400, damping: 10 },
      }}
      whileTap={{ scale: 0.9 }}
      className="p-10 bg-white rounded-full shadow-2xl border-4 border-orange-100 cursor-pointer flex items-center justify-center relative group"
    >
      <div className="absolute inset-0 rounded-full bg-orange-400 opacity-0 group-hover:opacity-10 blur-xl transition-opacity" />
      <div className="relative z-10 transition-colors duration-300 group-hover:text-orange-600">{icon}</div>
    </motion.div>
  )
}

function ScrollLine() {
  const { scrollYProgress } = useScroll()
  const pathLength = useSpring(scrollYProgress, {
    stiffness: 30,
    damping: 15,
  })

  return (
    <svg
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      viewBox="0 0 100 1000"
      preserveAspectRatio="none"
    >
      <path
        d="M 50 50 Q 80 150 50 250 T 50 450 T 50 650 T 50 850"
        fill="none"
        stroke="#e2e8f0"
        strokeWidth="1"
      />
      <motion.path
        d="M 50 50 Q 80 150 50 250 T 50 450 T 50 650 T 50 850"
        fill="none"
        stroke="#ea580c"
        strokeWidth="1"
        style={{ pathLength }}
      />
    </svg>
  )
}

function ParallaxSection({ step, index }: { step: (typeof storySteps)[number]; index: number }) {
  const ref = useRef<HTMLElement | null>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })

  // Reduce parallax intensity for mobile to avoid "shaking" feel
  const yBg = useTransform(scrollYProgress, [0, 1], [0, -80])
  const yText = useTransform(scrollYProgress, [0, 1], [50, -50])
  const graphic = storyGraphics[index % storyGraphics.length]

  return (
    <section
      ref={ref}
      className={`min-h-screen md:h-[120vh] flex items-center justify-center overflow-hidden relative py-20 md:py-0 ${step.color}`}
    >
      {/* Background Icon: Scaled down for mobile */}
      <motion.div style={{ y: yBg }} className="absolute opacity-5 pointer-events-none">
        <step.icon className="w-64 h-64 md:w-[40rem] md:h-[40rem]" aria-hidden />
      </motion.div>

      <motion.div
        style={{ y: yText }}
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.05 * index }}
        viewport={{ margin: "-15% 0px -15% 0px", amount: 0.35 }}
        className="relative z-10 max-w-5xl w-full flex flex-col md:flex-row items-center gap-8 md:gap-12 px-6 md:px-8"
      >
        {/* Responsive Icon Size */}
        <div className="scale-75 md:scale-100">
          <InteractiveIcon icon={<step.icon className="w-16 h-16" aria-hidden />} />
        </div>

        <div className="bg-white/90 backdrop-blur-md p-6 md:p-8 rounded-2xl shadow-sm border border-orange-50 text-center md:text-left space-y-4 flex-1">
          <h2 className="text-2xl md:text-4xl font-bold text-gray-800 mb-1 md:mb-2">{step.title}</h2>
          <p className="text-base md:text-xl text-gray-600 leading-relaxed max-w-md mx-auto md:mx-0">{step.description}</p>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="mt-2 text-orange-600 font-semibold flex items-center justify-center md:justify-start gap-2 text-sm uppercase tracking-widest"
          >
            Hover to explore <span className="animate-pulse">→</span>
          </motion.div>
        </div>

        <div className="w-full md:w-[320px]">
          <div className="relative w-full h-48 md:h-64 rounded-2xl overflow-hidden border border-orange-100/70 shadow-sm bg-white/70">
            <Image
              src={graphic}
              alt={`${step.title} illustration`}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 320px, 100vw"
              priority={index === 0}
            />
          </div>
        </div>
      </motion.div>
    </section>
  )
}

export default function StoryPage() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  })

  // Dynamic background color interpolation based on scroll progress
  const backgroundColor = useTransform(
    scrollYProgress,
    [0, 0.2, 0.4, 0.6, 0.8, 1],
    ["#fff7ed", "#fff4e6", "#fff1e0", "#fff5eb", "#fff3e0", "#fff8f3"]
  )

  return (
    <>
      <Header />
      <motion.main style={{ backgroundColor }} className="relative min-h-screen text-gray-900 pt-16">
        {/* Hide the complex SVG line on very small screens to maintain performance */}
        <div className="hidden md:block">
          <ScrollLine />
        </div>

        {/* Progress Bar */}
        <motion.div className="fixed top-0 left-0 right-0 h-1.5 md:h-2 bg-orange-600 origin-left z-50" style={{ scaleX }} />

        {/* Hero Section: Responsive font sizes */}
        <section className="h-screen flex flex-col items-center justify-center text-center px-6 bg-gradient-to-b from-[#fff7ed] via-white to-white relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none opacity-80">
            <Image src="/story/graphic-1.svg" alt="Story glow" fill priority className="object-cover" sizes="100vw" />
          </div>
          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-center gap-3">
              <Image src="/logo-banner-xl.png" alt="Namecheap" width={200} height={60} className="h-10 w-auto" priority />
              <span className="px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] bg-white/70 text-orange-700 rounded-full border border-orange-100">
                Story Edition
              </span>
            </div>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-4xl sm:text-5xl md:text-7xl font-bold text-gray-900 mb-2"
            >
              How We Deliver <span className="text-orange-600">Extra Value</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
              className="text-base md:text-xl text-gray-700 max-w-2xl mx-auto"
            >
              Scroll down to see our journey from understanding your needs to passing savings directly back to you.
            </motion.p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Link href="/home" className="inline-flex">
                <Button className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-3 md:px-6 md:py-3 rounded-full text-sm md:text-base font-semibold shadow-lg shadow-orange-200">
                  Discover Discounts
                </Button>
              </Link>
              <Link href="/shop" className="inline-flex">
                <Button variant="outline" className="bg-white/80 text-orange-700 border-orange-200 hover:bg-orange-50 px-5 py-3 md:px-6 md:py-3 rounded-full text-sm md:text-base font-semibold">
                  Shop Products
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Story Sections with parallax depth */}
        {storySteps.map((step, index) => (
          <ParallaxSection key={step.title} step={step} index={index} />
        ))}

        {/* Final CTA: Responsive Padding */}
        <section className="h-screen flex items-center justify-center bg-gray-900 text-white px-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <Image src="/story/graphic-3.svg" alt="Closing glow" fill className="object-cover" sizes="100vw" />
          </div>
          <div className="text-center space-y-6 relative z-10">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">Ready to start saving?</h2>
            <p className="text-base md:text-lg text-gray-200 max-w-2xl mx-auto">
              Explore curated organic brands with exclusive discounts we negotiate and pass directly to you.
            </p>
            <Link href="/home" className="inline-flex">
              <Button className="bg-orange-500 hover:bg-orange-400 text-white px-8 py-4 md:px-10 md:py-5 rounded-full text-lg md:text-xl font-semibold shadow-lg shadow-orange-500/30">
                Discover Discounts
              </Button>
            </Link>
          </div>
        </section>
      </motion.main>
    </>
  )
}
