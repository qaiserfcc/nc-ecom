"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Loader2 } from "lucide-react"

interface Brand {
  id: number
  name: string
  logo_url: string
  slug: string
}

export default function Brands() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch("/api/brands")
        if (!response.ok) throw new Error("Failed to fetch brands")
        const data = await response.json()
        setBrands(data.brands || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load brands")
      } finally {
        setLoading(false)
      }
    }

    fetchBrands()
  }, [])

  if (loading) {
    return (
      <section className="py-8 sm:py-12 md:py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2 text-foreground">Brands We Partner With</h2>
          <p className="text-center text-muted-foreground mb-8 sm:mb-12">
            Featuring premium organic brands from around the world
          </p>
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-8 sm:py-12 md:py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2 text-foreground">Brands We Partner With</h2>
          <p className="text-center text-muted-foreground mb-8 sm:mb-12">
            Featuring premium organic brands from around the world
          </p>
          <div className="text-center py-20">
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
      </section>
    )
  }

  if (brands.length === 0) {
    return (
      <section className="py-8 sm:py-12 md:py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2 text-foreground">Brands We Partner With</h2>
          <p className="text-center text-muted-foreground mb-8 sm:mb-12">
            Featuring premium organic brands from around the world
          </p>
          <div className="text-center py-20">
            <p className="text-muted-foreground">No brands available</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-8 sm:py-12 md:py-16 bg-muted/50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2 text-foreground">Brands We Partner With</h2>
        <p className="text-center text-muted-foreground mb-8 sm:mb-12">
          Featuring premium organic brands from around the world
        </p>

        <div className="flex flex-wrap justify-center gap-6 sm:gap-8 md:gap-12">
          {brands.map((brand) => (
            <Link key={brand.id} href={`/brand/${brand.id}`}>
              <div className="flex flex-col items-center gap-3 p-4 rounded-lg hover:bg-background/50 transition">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-white border border-border flex items-center justify-center overflow-hidden">
                  <img src={brand.logo_url || "/placeholder.svg"} alt={brand.name} className="w-full h-full object-cover" />
                </div>
                <p className="text-center text-sm sm:text-base font-medium text-foreground hover:text-primary">
                  {brand.name}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
