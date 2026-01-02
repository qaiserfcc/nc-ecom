"use client"

import { useState, use } from "react"
import Link from "next/link"
import useSWR from "swr"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, ChevronLeft } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function BrandPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  const { data, isLoading, error } = useSWR(`/api/brands/${id}`, fetcher)
  const brand = data?.brand

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <Footer />
      </>
    )
  }

  if (error || !brand) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex flex-col items-center justify-center">
          <p className="text-muted-foreground mb-4">Brand not found</p>
          <Button asChild>
            <Link href="/shop">Back to Shop</Link>
          </Button>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-primary">
              Home
            </Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-primary">
              Shop
            </Link>
            <span>/</span>
            <span className="text-foreground">Brands</span>
            <span>/</span>
            <span className="text-foreground">{brand.name}</span>
          </nav>

          <Button variant="ghost" size="sm" className="mb-4" asChild>
            <Link href="/shop">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Link>
          </Button>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
            {/* Brand Logo */}
            <div className="space-y-4">
              <div className="rounded-lg overflow-hidden bg-muted p-8 min-h-96 flex items-center justify-center">
                <img
                  src={brand.logo_url || "/placeholder.svg"}
                  alt={brand.name}
                  className="max-w-full max-h-96 object-contain"
                />
              </div>
            </div>

            {/* Brand Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl font-bold text-balance mb-2">{brand.name}</h1>
                {brand.is_featured && (
                  <div className="inline-block bg-primary/10 text-primary px-3 py-1 rounded text-sm font-medium">
                    Featured Partner
                  </div>
                )}
              </div>

              <p className="text-lg text-muted-foreground">{brand.description}</p>

              {brand.website_url && (
                <div>
                  <p className="text-sm font-medium mb-2">Official Website</p>
                  <Button asChild variant="outline">
                    <a href={brand.website_url} target="_blank" rel="noopener noreferrer">
                      Visit Website
                    </a>
                  </Button>
                </div>
              )}

              {brand.contact_email && (
                <div>
                  <p className="text-sm font-medium mb-2">Contact</p>
                  <a href={`mailto:${brand.contact_email}`} className="text-primary hover:underline">
                    {brand.contact_email}
                  </a>
                </div>
              )}

              {/* Products from this brand */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold">Products from {brand.name}</h3>
                <Button asChild size="lg" className="w-full">
                  <Link href={`/shop?brand=${brand.slug}`}>
                    View All Products
                  </Link>
                </Button>
              </div>

              {/* About Section */}
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-1">About This Brand</p>
                    <p className="text-sm text-muted-foreground">
                      {brand.description || `${brand.name} is a trusted partner in our marketplace, offering quality products.`}
                    </p>
                  </div>
                  {brand.established_year && (
                    <div>
                      <p className="text-sm font-medium mb-1">Established</p>
                      <p className="text-sm text-muted-foreground">{brand.established_year}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
