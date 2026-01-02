"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react"

interface Banner {
  id: number
  title: string
  description: string
  image_url: string
  link_url: string
  is_active: boolean
  sort_order: number
}

export default function HeroBanner() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch("/api/banners?active=true")
        if (!response.ok) throw new Error("Failed to fetch banners")
        const data = await response.json()
        setBanners(data.banners || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load banners")
      } finally {
        setLoading(false)
      }
    }

    fetchBanners()
  }, [])

  useEffect(() => {
    if (banners.length === 0) return

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [banners.length])

  if (loading) {
    return (
      <section className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] overflow-hidden rounded-lg md:rounded-xl bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </section>
    )
  }

  if (error || banners.length === 0) {
    return (
      <section className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] overflow-hidden rounded-lg md:rounded-xl bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20">
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-balance text-foreground mb-4">
            Premium Organic Products for You
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mb-6">
            Discover authentic skincare, haircare, and organic foods with profit-sharing benefits
          </p>
          <Link href="/shop">
            <Button className="px-6 sm:px-8 py-2 sm:py-3">
              Shop Now
            </Button>
          </Link>
        </div>
      </section>
    )
  }

  const currentBanner = banners[currentIndex]

  return (
    <section className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] overflow-hidden rounded-lg md:rounded-xl group">
      {/* Banner Image */}
      <img
        src={currentBanner.image_url || "/placeholder.svg"}
        alt={currentBanner.title}
        className="w-full h-full object-cover"
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-10">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-balance text-white mb-4">
          {currentBanner.title}
        </h1>
        <p className="text-base sm:text-lg text-gray-100 max-w-2xl mb-6">
          {currentBanner.description}
        </p>
        <Link href={currentBanner.link_url || "/shop"}>
          <Button className="px-6 sm:px-8 py-2 sm:py-3 text-base">
            Shop Now
          </Button>
        </Link>
      </div>

      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={() => setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/30 hover:bg-white/50 text-white p-2 rounded-full transition opacity-0 group-hover:opacity-100"
            aria-label="Previous banner"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % banners.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/30 hover:bg-white/50 text-white p-2 rounded-full transition opacity-0 group-hover:opacity-100"
            aria-label="Next banner"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Navigation Dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition ${
                index === currentIndex ? "bg-white" : "bg-white/50 hover:bg-white/70"
              }`}
              aria-label={`Go to banner ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  )
}
