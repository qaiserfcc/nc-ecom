import React, { useState, useRef } from "react"
import Image from "next/image"
import { Button } from "./button"
import { Input } from "./input"
import { Label } from "./label"
import { Alert, AlertDescription } from "./alert"
import { Upload, X, Image as ImageIcon } from "lucide-react"

interface ImageUploadProps {
  value: string
  onChange: (value: string) => void
  onThumbnailChange?: (value: string) => void
  onFileSelect?: (file: File) => void
  label?: string
  required?: boolean
}

export function ImageUpload({
  value,
  onChange,
  onThumbnailChange,
  onFileSelect,
  label = "Image",
  required = false,
}: ImageUploadProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [preview, setPreview] = useState(value)
  const [optimizationInfo, setOptimizationInfo] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const placeholder = "/placeholder.svg?height=320&width=320"

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError("")
      setOptimizationInfo("")
    setLoading(true)

    try {
      // Validate file
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file")
        setLoading(false)
        return
      }

      if (file.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB")
        setLoading(false)
        return
      }

      // Upload and optimize on server
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to upload image")
      }

      const data = await response.json()
      const mainUrl = data.url || placeholder
      const thumbUrl = data.thumbnailUrl || ""

      setPreview(mainUrl)
      onChange(mainUrl)
      
      if (onThumbnailChange && thumbUrl) {
        onThumbnailChange(thumbUrl)
      }
      
      // Show optimization info
      if (data.sizeReduction) {
        const originalKB = Math.round(data.originalSize / 1024)
        const optimizedKB = Math.round(data.optimizedSize / 1024)
        setOptimizationInfo(
          `Optimized: ${originalKB}KB → ${optimizedKB}KB (${data.sizeReduction} reduction)`
        )
      }

      if (onFileSelect) {
        onFileSelect(file)
      }
    } catch (err: any) {
      setError(err.message || "Failed to process image")
    } finally {
      setLoading(false)
    }
  }

  const clearImage = () => {
    setPreview("")
    onChange("")
    if (onThumbnailChange) {
      onThumbnailChange("")
    }
    setOptimizationInfo("")
    setError("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-3">
      <Label htmlFor="image-upload">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </Label>

      {preview ? (
        <div className="space-y-3">
          <div className="relative inline-block w-full max-w-xs h-64">
            <Image
              src={preview}
              alt="Preview"
              fill
              className="rounded-lg border border-border object-cover"
              sizes="320px"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute -top-2 -right-2 bg-background border border-border hover:bg-destructive hover:text-destructive-foreground"
              onClick={clearImage}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => fileInputRef.current?.click()}
          >
            Change Image
          </Button>
        </div>
      ) : (
        <div
          className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <ImageIcon className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm font-medium">Click to upload or drag and drop</p>
          <p className="text-xs text-muted-foreground">PNG, JPG, WebP up to 10MB</p>
        </div>
      )}

      <input
        ref={fileInputRef}
        id="image-upload"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={loading}
        aria-label={label}
      />

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-4 h-4 border-2 border-muted-foreground border-t-primary rounded-full animate-spin" />
          Optimizing image...
        </div>
      )}

      {optimizationInfo && !error && !loading && (
        <p className="text-xs text-green-600">{optimizationInfo}</p>
      )}

      <input
        type="hidden"
        id="image-url"
        name="image_url"
        value={value}
      />
    </div>
  )
}
