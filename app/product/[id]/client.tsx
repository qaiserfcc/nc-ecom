"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import useSWR, { useSWRConfig } from "swr"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, ShoppingCart, Minus, Plus, Truck, Shield, RotateCcw, Loader2, ChevronLeft } from "lucide-react"
import { useAuth } from "@/lib/hooks/use-auth"
import { notify } from "@/lib/utils/notifications"
import { useConfirm } from "@/components/ui/confirm-dialog"
import { OptimizedImage } from "@/components/optimized-image"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface ProductPageClientProps {
  initialProduct: any
  initialDiscount: any
  initialRelatedProducts: any[]
  slug: string
}

export default function ProductPageClient({
  initialProduct,
  initialDiscount,
  initialRelatedProducts,
  slug
}: ProductPageClientProps) {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const confirmDialog = useConfirm()
  const [quantity, setQuantity] = useState(1)
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [addingToCart, setAddingToCart] = useState(false)

  const { data, isLoading, error } = useSWR(`/api/products/${slug}`, fetcher, {
    fallbackData: { product: initialProduct }
  })
  const { data: discountData } = useSWR("/api/discounts/active", fetcher, {
    fallbackData: { discount: initialDiscount }
  })
  const { mutate } = useSWRConfig()

  const product = data?.product
  const activeDiscount = discountData?.discount

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      notify.warning("Please sign in", "You need to be logged in to add items to cart")
      router.push("/signin")
      return
    }

    const ok = await confirmDialog({
      title: "Add to cart",
      description: `Add ${quantity} item(s) to your shopping cart?`,
      confirmText: "Add",
      variant: "default",
    })
    
    if (!ok) return

    setAddingToCart(true)
    const toastId = notify.loading("Adding to cart...")
    
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: product.id,
          variant_id: selectedVariant,
          quantity,
        }),
      })
      
      notify.dismiss(toastId)
      
      if (!response.ok) {
        throw new Error("Failed to add to cart")
      }
      
      notify.success("Added to cart!", `${quantity} item(s) added - view your cart`)
      // Revalidate cart count
      mutate("/api/cart")
      setTimeout(() => router.push("/cart"), 1500)
    } catch (error) {
      console.error("Failed to add to cart:", error)
      notify.dismiss(toastId)
      notify.error("Failed to add to cart", error instanceof Error ? error.message : "Please try again")
    } finally {
      setAddingToCart(false)
    }
  }

  const handleAddToWishlist = async () => {
    if (!isAuthenticated) {
      notify.warning("Please sign in", "You need to be logged in to add items to wishlist")
      router.push("/signin")
      return
    }

    const ok = await confirmDialog({
      title: "Add to wishlist",
      description: "Save this item to your wishlist?",
      confirmText: "Add",
      variant: "default",
    })
    
    if (!ok) return

    const toastId = notify.loading("Adding to wishlist...")
    try {
      const response = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: product.id }),
      })
      
      notify.dismiss(toastId)
      
      if (!response.ok) {
        throw new Error("Failed to add to wishlist")
      }
      
      notify.success("Added to wishlist!", "View your wishlist anytime")
      // Revalidate wishlist count
      mutate("/api/wishlist")
    } catch (error) {
      notify.dismiss(toastId)
      notify.error("Failed to add to wishlist", error instanceof Error ? error.message : "Please try again")
    }
  }

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

  if (error || !product) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex flex-col items-center justify-center">
          <p className="text-muted-foreground mb-4">Product not found</p>
          <Button asChild>
            <Link href="/shop">Back to Shop</Link>
          </Button>
        </div>
        <Footer />
      </>
    )
  }

  const placeholderImage = "/placeholder.svg"

  const images =
    product.images?.length > 0
      ? product.images
      : [
          {
            id: 0,
            image_url: product.image_url || placeholderImage,
            is_primary: true,
          },
        ]

  const variants = product.variants || []
  const selectedVariantData = variants.find((v: any) => v.id === selectedVariant)
  
  const formatPrice = (value: number) => `Rs. ${Math.round(value).toLocaleString()}`

  const calculateDiscountedPrice = (price: number) => {
    if (!activeDiscount) return price
    
    if (activeDiscount.discount_type === "percentage") {
      return price - (price * activeDiscount.discount_value) / 100
    } else {
      return Math.max(0, price - activeDiscount.discount_value)
    }
  }

  const variantModifier = selectedVariantData ? Number(selectedVariantData.price_modifier) : 0
  const sellingPrice = Number(product.current_price) + variantModifier
  const officialPrice = (Number(product.original_price) || Number(product.current_price)) + variantModifier
  const finalPrice = calculateDiscountedPrice(sellingPrice)

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
            <Link href={`/shop?category=${product.category_slug}`} className="hover:text-primary">
              {product.category_name}
            </Link>
            <span>/</span>
            <span className="text-foreground break-words max-w-xs truncate">{product.name}</span>
          </nav>

          <Button variant="ghost" size="sm" className="mb-4" onClick={() => router.back()}>
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                <Image
                  src={
                    images[selectedImage]?.image_url || placeholderImage
                  }
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
                {product.is_new_arrival && (
                  <Badge className="absolute top-4 left-4 bg-secondary text-secondary-foreground">New Arrival</Badge>
                )}
                {activeDiscount && (
                  <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground">
                    {activeDiscount.discount_type === "percentage"
                      ? `${activeDiscount.discount_value}% OFF`
                      : `Rs. ${activeDiscount.discount_value} OFF`}
                  </Badge>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {images.map((img: any, index: number) => (
                    <button
                      key={img.id}
                      onClick={() => setSelectedImage(index)}
                      className={`relative w-20 h-20 rounded-md overflow-hidden shrink-0 border-2 cursor-pointer hover:opacity-75 transition-opacity ${
                        selectedImage === index ? "border-primary" : "border-transparent"
                      }`}
                      aria-label={`Select image ${index + 1}`}
                    >
                      <Image
                        src={img.image_url || placeholderImage}
                        alt={`${product.name} ${index + 1}`}
                        fill
                        className="object-cover"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{product.category_name}</p>
                <h1 className="text-2xl md:text-3xl font-bold break-words line-clamp-2" title={product.name}>
                  {product.name}
                </h1>
              </div>

              <div className="rounded-lg border border-border/60 bg-muted/30 p-4 space-y-2">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Official Price</span>
                  <span className="line-through">{formatPrice(officialPrice)}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Selling Price</span>
                  <span className="line-through">{formatPrice(sellingPrice)}</span>
                </div>
                <div className="flex items-center justify-between text-lg font-semibold text-primary">
                  <span>Our Discounted Price</span>
                  <div className="flex items-center gap-2">
                    <span>{formatPrice(finalPrice)}</span>
                    {activeDiscount && (
                      <Badge className="text-xs bg-primary text-primary-foreground">
                        {activeDiscount.discount_type === "percentage"
                          ? `${activeDiscount.discount_value}% OFF`
                          : `Rs. ${activeDiscount.discount_value} OFF`}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-muted-foreground">{product.short_description || product.description}</p>

              {/* Variants */}
              {variants.length > 0 && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Select Variant</label>
                  <Select
                    value={selectedVariant?.toString() || ""}
                    onValueChange={(v) => setSelectedVariant(v ? Number(v) : null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an option" />
                    </SelectTrigger>
                    <SelectContent>
                      {variants.map((variant: any) => (
                        <SelectItem key={variant.id} value={variant.id.toString()}>
                          {variant.variant_name}: {variant.variant_value}
                          {variant.price_modifier !== 0 && ` (+Rs. ${Number(variant.price_modifier).toLocaleString()})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Quantity */}
              <div>
                <label className="text-sm font-medium mb-2 block">Quantity</label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                    disabled={quantity >= product.stock_quantity}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">{product.stock_quantity} in stock</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  className="flex-1"
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={addingToCart || product.stock_quantity === 0}
                >
                  {addingToCart ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <ShoppingCart className="w-5 h-5 mr-2" />
                  )}
                  {product.stock_quantity === 0 ? "Out of Stock" : "Add to Cart"}
                </Button>
                <Button variant="outline" size="lg" onClick={handleAddToWishlist} aria-label="Add to wishlist">
                  <Heart className="w-5 h-5" />
                </Button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div className="text-center">
                  <Truck className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <p className="text-xs text-muted-foreground">Free Shipping</p>
                </div>
                <div className="text-center">
                  <Shield className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <p className="text-xs text-muted-foreground">Secure Payment</p>
                </div>
                <div className="text-center">
                  <RotateCcw className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <p className="text-xs text-muted-foreground">Easy Returns</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="description" className="mt-12">
            <TabsList>
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="mt-4">
              <p className="text-muted-foreground whitespace-pre-wrap">{product.description}</p>
            </TabsContent>
            <TabsContent value="details" className="mt-4">
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-muted-foreground">Category</dt>
                  <dd className="font-medium">{product.category_name}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">SKU</dt>
                  <dd className="font-medium">{product.slug}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Stock</dt>
                  <dd className="font-medium">{product.stock_quantity} units</dd>
                </div>
                {variants.length > 0 && (
                  <div>
                    <dt className="text-sm text-muted-foreground">Variants</dt>
                    <dd className="font-medium">{variants.length} options</dd>
                  </div>
                )}
              </dl>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </>
  )
}
