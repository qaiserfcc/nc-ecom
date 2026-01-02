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

export default function NewBrandPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    logo_url: "",
    website_url: "",
    contact_email: "",
    is_featured: false,
    is_active: true,
    established_year: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "name" && { slug: value.toLowerCase().replace(/\s+/g, "-") }),
    }))
  }

  const handleToggle = (field: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: !prev[field as keyof typeof formData],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name) {
      setError("Please fill in all required fields")
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          established_year: formData.established_year ? parseInt(formData.established_year) : null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to create brand")
      }

      router.push("/admin/brands")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link href="/admin/brands">
          <Button variant="ghost">← Back</Button>
        </Link>
        <h1 className="text-3xl font-bold text-foreground mt-4">Create Brand</h1>
        <p className="text-muted-foreground mt-1">Add a new brand partner</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Brand Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Brand Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Organic Essentials"
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
                placeholder="Tell us about this brand..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo_url">Logo URL</Label>
              <Input
                id="logo_url"
                name="logo_url"
                value={formData.logo_url}
                onChange={handleChange}
                placeholder="https://example.com/logo.png"
                type="url"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website_url">Website URL</Label>
              <Input
                id="website_url"
                name="website_url"
                value={formData.website_url}
                onChange={handleChange}
                placeholder="https://brand.com"
                type="url"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_email">Contact Email</Label>
              <Input
                id="contact_email"
                name="contact_email"
                value={formData.contact_email}
                onChange={handleChange}
                placeholder="contact@brand.com"
                type="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="established_year">Established Year</Label>
              <Input
                id="established_year"
                name="established_year"
                value={formData.established_year}
                onChange={handleChange}
                placeholder="2020"
                type="number"
                min="1900"
                max={new Date().getFullYear()}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_featured"
                  checked={formData.is_featured}
                  onCheckedChange={() => handleToggle("is_featured")}
                />
                <Label htmlFor="is_featured" className="cursor-pointer">
                  Featured Brand
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={() => handleToggle("is_active")}
                />
                <Label htmlFor="is_active" className="cursor-pointer">
                  Active
                </Label>
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create Brand
              </Button>
              <Link href="/admin/brands">
                <Button variant="outline">Cancel</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
