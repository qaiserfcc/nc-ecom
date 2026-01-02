"use client"

import type React from "react"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ChevronLeft, Loader2, Plus, X } from "lucide-react"
import { ImageUpload } from "@/components/ui/image-upload"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface Variant {
  id?: number
  variant_name: string
  variant_value: string
  sku: string
  price_modifier: number
  stock_quantity: number
}

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { data: productData, isLoading: productLoading } = useSWR(`/api/products/${id}`, fetcher)
  const { data: categoriesData } = useSWR("/api/categories", fetcher)

  const categories = categoriesData?.categories || []
  const product = productData?.product

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [description, setDescription] = useState("")
  const [shortDescription, setShortDescription] = useState("")
  const [originalPrice, setOriginalPrice] = useState("")
  const [currentPrice, setCurrentPrice] = useState("")
  const [stockQuantity, setStockQuantity] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [isFeatured, setIsFeatured] = useState(false)
  const [isNewArrival, setIsNewArrival] = useState(false)
  const [variants, setVariants] = useState<Variant[]>([])

  useEffect(() => {
    if (product) {
      setName(product.name || "")
      setSlug(product.slug || "")
      setCategoryId(product.category_id?.toString() || "")
      setDescription(product.description || "")
      setShortDescription(product.short_description || "")
      setOriginalPrice(product.original_price?.toString() || "")
      setCurrentPrice(product.current_price?.toString() || "")
      setStockQuantity(product.stock_quantity?.toString() || "")
      setImageUrl(product.image_url || "")
      setIsFeatured(product.is_featured || false)
      setIsNewArrival(product.is_new_arrival || false)
      setVariants(product.variants || [])
    }
  }, [product])

  const addVariant = () => {
    setVariants([...variants, { variant_name: "", variant_value: "", sku: "", price_modifier: 0, stock_quantity: 0 }])
  }

  const updateVariant = (index: number, field: keyof Variant, value: string | number) => {
    const updated = [...variants]
    updated[index] = { ...updated[index], [field]: value }
    setVariants(updated)
  }

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!name || !categoryId || !originalPrice || !currentPrice) {
      setError("Please fill in all required fields")
      return
    }

    setLoading(true)

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug,
          category_id: Number.parseInt(categoryId),
          description,
          short_description: shortDescription,
          original_price: Number.parseFloat(originalPrice),
          current_price: Number.parseFloat(currentPrice),
          stock_quantity: Number.parseInt(stockQuantity) || 0,
          image_url: imageUrl,
          is_featured: isFeatured,
          is_new_arrival: isNewArrival,
          variants: variants.filter((v) => v.variant_name && v.variant_value),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to update product")
      }

      router.push("/admin/products")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (productLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground mb-4">Product not found</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Edit Product</h1>
          <p className="text-muted-foreground">Update product information</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat: any) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="shortDesc">Short Description</Label>
                <Input id="shortDesc" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Full Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Pricing & Stock */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing & Stock</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="originalPrice">Original Price *</Label>
                <Input
                  id="originalPrice"
                  type="number"
                  step="0.01"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentPrice">Current Price *</Label>
                <Input
                  id="currentPrice"
                  type="number"
                  step="0.01"
                  value={currentPrice}
                  onChange={(e) => setCurrentPrice(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock Quantity</Label>
                <Input
                  id="stock"
                  type="number"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                />
              </div>
              <ImageUpload
                value={imageUrl}
                onChange={setImageUrl}
                label="Product Image"
              />
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="featured">Featured Product</Label>
                  <Switch id="featured" checked={isFeatured} onCheckedChange={setIsFeatured} />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="newArrival">New Arrival</Label>
                  <Switch id="newArrival" checked={isNewArrival} onCheckedChange={setIsNewArrival} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Variants */}
          <Card className="lg:col-span-3">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Product Variants</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addVariant}>
                <Plus className="w-4 h-4 mr-1" />
                Add Variant
              </Button>
            </CardHeader>
            <CardContent>
              {variants.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No variants</p>
              ) : (
                <div className="space-y-4">
                  {variants.map((variant, index) => (
                    <div key={index} className="flex flex-wrap gap-3 p-4 border rounded-lg relative">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6"
                        onClick={() => removeVariant(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                      <div className="flex-1 min-w-[150px]">
                        <Label className="text-xs">Variant Name</Label>
                        <Input
                          value={variant.variant_name}
                          onChange={(e) => updateVariant(index, "variant_name", e.target.value)}
                        />
                      </div>
                      <div className="flex-1 min-w-[150px]">
                        <Label className="text-xs">Value</Label>
                        <Input
                          value={variant.variant_value}
                          onChange={(e) => updateVariant(index, "variant_value", e.target.value)}
                        />
                      </div>
                      <div className="w-[120px]">
                        <Label className="text-xs">SKU</Label>
                        <Input value={variant.sku} onChange={(e) => updateVariant(index, "sku", e.target.value)} />
                      </div>
                      <div className="w-[100px]">
                        <Label className="text-xs">Price +/-</Label>
                        <Input
                          type="number"
                          value={variant.price_modifier}
                          onChange={(e) =>
                            updateVariant(index, "price_modifier", Number.parseFloat(e.target.value) || 0)
                          }
                        />
                      </div>
                      <div className="w-[80px]">
                        <Label className="text-xs">Stock</Label>
                        <Input
                          type="number"
                          value={variant.stock_quantity}
                          onChange={(e) => updateVariant(index, "stock_quantity", Number.parseInt(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  )
}
