"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Trash2 } from "lucide-react"
import Link from "next/link"

interface BundleItem {
  id: number
  product_id: number
  quantity: number
  product_name: string
  product_price: number
}

interface Bundle {
  id: number
  name: string
  slug: string
  description: string
  bundle_price: number
  image_url: string
  is_active: boolean
  items: BundleItem[]
}

export default function EditBundlePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { id } = params
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [bundle, setBundle] = useState<Bundle | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    bundle_price: "",
    image_url: "",
    is_active: true,
  })

  useEffect(() => {
    fetchBundle()
  }, [id])

  const fetchBundle = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/bundles/${id}`)
      if (!response.ok) throw new Error("Failed to fetch bundle")
      const data = await response.json()
      setBundle(data.bundle)
      setFormData({
        name: data.bundle.name,
        slug: data.bundle.slug,
        description: data.bundle.description || "",
        bundle_price: data.bundle.bundle_price.toString(),
        image_url: data.bundle.image_url || "",
        is_active: data.bundle.is_active,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load bundle")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleToggle = () => {
    setFormData((prev) => ({
      ...prev,
      is_active: !prev.is_active,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.bundle_price) {
      setError("Please fill in all required fields")
      return
    }

    try {
      setSaving(true)
      setError(null)

      const response = await fetch(`/api/bundles/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          bundle_price: parseFloat(formData.bundle_price),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to update bundle")
      }

      router.push("/admin/bundles")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteItem = async (itemId: number) => {
    if (!confirm("Remove this product from the bundle?")) return

    try {
      const response = await fetch(`/api/bundles/${id}/items/${itemId}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Failed to remove item")
      if (bundle) {
        setBundle({
          ...bundle,
          items: bundle.items.filter((item) => item.id !== itemId),
        })
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to remove item")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link href="/admin/bundles">
          <Button variant="ghost">← Back</Button>
        </Link>
        <h1 className="text-3xl font-bold text-foreground mt-4">Edit Bundle</h1>
        <p className="text-muted-foreground mt-1">Update bundle details</p>
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
                placeholder="Bundle name"
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
                placeholder="bundle-slug"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Bundle description..."
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
                onCheckedChange={handleToggle}
              />
              <Label htmlFor="is_active" className="cursor-pointer">
                Active
              </Label>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
              <Link href="/admin/bundles">
                <Button variant="outline">Cancel</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      {bundle && bundle.items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Bundle Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bundle.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium">{item.product_name}</p>
                    <p className="text-sm text-muted-foreground">
                      Qty: {item.quantity} × Rs. {item.product_price.toLocaleString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDeleteItem(item.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
