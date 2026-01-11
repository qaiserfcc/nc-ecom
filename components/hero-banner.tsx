"use client"

import { useState, useEffect } from "react"
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
  const fallbackImage =
    "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1400&q=60&sat=-10"
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
      <section className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] overflow-hidden rounded-lg md:rounded-xl">
        <Image
          src={fallbackImage}
          alt="Natural skincare products banner"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      </section>
    )
  }

  const currentBanner = banners[currentIndex]
  const imageSrc = currentBanner?.image_url?.trim() || fallbackImage

  return (
    <section className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] overflow-hidden rounded-lg md:rounded-xl group">
      {/* Banner Image with Transition */}
      <div 
        key={currentIndex}
        className="absolute inset-0 animate-fade-in"
      >
        <Image
          src={imageSrc}
          alt={currentBanner.title}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
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
