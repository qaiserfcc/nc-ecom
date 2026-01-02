"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ImageUpload } from "@/components/ui/image-upload"
import { Switch } from "@/components/ui/switch"
import { ChevronLeft, Loader2 } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function EditBannerPage() {
  const router = useRouter()
  const params = useParams()
  const bannerId = params.id as string

  const { data: bannerData, isLoading } = useSWR(bannerId ? `/api/banners/${bannerId}` : null, fetcher)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [linkUrl, setLinkUrl] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [sortOrder, setSortOrder] = useState("0")

  // Load banner data
  useEffect(() => {
    if (bannerData?.banner) {
      const banner = bannerData.banner
      setTitle(banner.title || "")
      setDescription(banner.description || "")
      setImageUrl(banner.image_url || "")
      setLinkUrl(banner.link_url || "")
      setIsActive(banner.is_active || true)
      setSortOrder(banner.sort_order?.toString() || "0")
    }
  }, [bannerData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!title.trim() || !imageUrl.trim()) {
      setError("Title and image are required")
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/banners/${bannerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: description || null,
          image_url: imageUrl,
          link_url: linkUrl || null,
          is_active: isActive,
          sort_order: Number.parseInt(sortOrder) || 0,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.error || "Failed to update banner")
        setLoading(false)
        return
      }

      router.push("/admin/banners")
    } catch (err: any) {
      setError(err.message || "Error updating banner")
      setLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
          <h1 className="text-2xl md:text-3xl font-bold">Edit Banner</h1>
          <p className="text-muted-foreground">Update homepage banner details</p>
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
              <CardTitle>Banner Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Banner Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="link">Link URL</Label>
                <Input
                  id="link"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  type="url"
                  placeholder="e.g., /shop?category=summer"
                />
              </div>
            </CardContent>
          </Card>

          {/* Image & Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Banner Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ImageUpload
                value={imageUrl}
                onChange={setImageUrl}
                label="Banner Image"
                required
              />
              <div className="space-y-2">
                <Label htmlFor="order">Display Order</Label>
                <Input
                  id="order"
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  min="0"
                />
                <p className="text-xs text-muted-foreground">Lower numbers appear first</p>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="active">Active</Label>
                <Switch id="active" checked={isActive} onCheckedChange={setIsActive} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Update Banner
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
