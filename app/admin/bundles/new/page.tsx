"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2 } from "lucide-react"
import Link from "next/link"

interface Product {
  id: number
  name: string
  price: number
}

export default function NewBundlePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    bundle_price: "",
    image_url: "",
    is_active: true,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "name" && { slug: value.toLowerCase().replace(/\s+/g, "-") }),
    }))
  }

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      is_active: e.target.checked,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.bundle_price) {
      setError("Please fill in all required fields")
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/bundles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          bundle_price: parseFloat(formData.bundle_price),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to create bundle")
      }

      const data = await response.json()
      router.push("/admin/bundles")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link href="/admin/bundles">
          <Button variant="ghost">← Back</Button>
        </Link>
        <h1 className="text-3xl font-bold text-foreground mt-4">Create Bundle</h1>
        <p className="text-muted-foreground mt-1">Add a new product bundle to your store</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bundle Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Bundle Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Complete Skincare Bundle"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                placeholder="Auto-generated from name"
                disabled
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the bundle and its contents..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bundle_price">Bundle Price (Rs.) *</Label>
              <Input
                id="bundle_price"
                name="bundle_price"
                type="number"
                value={formData.bundle_price}
                onChange={handleChange}
                placeholder="0"
                required
                step="0.01"
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image_url">Image URL</Label>
              <Input
                id="image_url"
                name="image_url"
                value={formData.image_url}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                type="url"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, is_active: checked === true }))
                }
              />
              <Label htmlFor="is_active" className="cursor-pointer">
                Active
              </Label>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create Bundle
              </Button>
              <Link href="/admin/bundles">
                <Button variant="outline">Cancel</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add Products to Bundle</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            After creating the bundle, you can add products from the edit page.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
