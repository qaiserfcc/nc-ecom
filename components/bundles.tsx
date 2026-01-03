"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, Loader2 } from "lucide-react"

interface Bundle {
  id: number
  name: string
  slug: string
  bundle_price: number
  original_price: number
  image_url: string
}

export default function Bundles() {
  const [bundles, setBundles] = useState<Bundle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBundles = async () => {
      try {
        const response = await fetch("/api/bundles")
        if (!response.ok) throw new Error("Failed to fetch bundles")
        const data = await response.json()
        setBundles(data.bundles || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load bundles")
      } finally {
        setLoading(false)
      }
    }

    fetchBundles()
  }, [])

  if (loading) {
    return (
      <section className="py-8 sm:py-12 md:py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2 text-foreground">Product Bundles</h2>
          <p className="text-center text-muted-foreground mb-8 sm:mb-12">
            Get more with our curated product combinations at special prices
          </p>
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
      </section>
    )
  }

  if (error || bundles.length === 0) {
    return (
      <section className="py-8 sm:py-12 md:py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2 text-foreground">Product Bundles</h2>
          <p className="text-center text-muted-foreground mb-8 sm:mb-12">
            Get more with our curated product combinations at special prices
          </p>
          <Card>
            <CardContent className="py-20 text-center">
              <p className="text-muted-foreground">{error || "No bundles available"}</p>
            </CardContent>
          </Card>
        </div>
      </section>
    )
  }

  const calculateSavings = (original: number, current: number): number => {
    return Math.max(0, original - current)
  }

  return (
    <section className="py-8 sm:py-12 md:py-16 bg-muted/50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2 text-foreground">Product Bundles</h2>
        <p className="text-center text-muted-foreground mb-8 sm:mb-12">
          Get more with our curated product combinations at special prices
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {bundles.map((bundle, index) => {
            const delayClass = index < 8 ? `animation-delay-${(index + 1) * 100}` : '';
            return (
              <Card 
                key={bundle.id} 
                className={`overflow-hidden hover:shadow-lg transition-all duration-300 group animate-fade-in ${delayClass}`}
              >
                <CardContent className="p-0">
                  <Link href={`/bundle/${bundle.id}`}>
                    <div className="relative overflow-hidden bg-muted h-40 sm:h-48">
                      <img
                        src={bundle.image_url || "/placeholder.svg"}
                        alt={bundle.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                      />
                    </div>
                  </Link>
                  <div className="p-4 sm:p-6">
                    <Link href={`/bundle/${bundle.id}`}>
                      <h3 className="font-bold text-base sm:text-lg mb-2 text-foreground hover:text-primary transition-colors">
                        {bundle.name}
                      </h3>
                    </Link>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-lg sm:text-xl font-bold text-primary">Rs. {bundle.bundle_price.toLocaleString()}</span>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/bundle/${bundle.id}`} className="flex-1">
                        <Button size="sm" className="w-full transition-transform hover:scale-105">
                          View Bundle
                        </Button>
                      </Link>
                      <Button size="sm" variant="outline" className="flex-1 transition-transform hover:scale-105">
                        <Heart className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
