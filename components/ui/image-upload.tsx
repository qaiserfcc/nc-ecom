import React, { useState, useRef } from "react"
import { Button } from "./button"
import { Input } from "./input"
import { Label } from "./label"
import { Alert, AlertDescription } from "./alert"
import { Upload, X, Image as ImageIcon } from "lucide-react"

interface ImageUploadProps {
  value: string
  onChange: (value: string) => void
  onFileSelect?: (file: File) => void
  label?: string
  required?: boolean
}

export function ImageUpload({
  value,
  onChange,
  onFileSelect,
  label = "Image",
  required = false,
}: ImageUploadProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [preview, setPreview] = useState(value)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError("")
    setLoading(true)

    try {
      // Validate file
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file")
        setLoading(false)
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB")
        setLoading(false)
        return
      }

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string
        setPreview(dataUrl)
        onChange(dataUrl)
      }
      reader.readAsDataURL(file)

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
          <div className="relative inline-block">
            <img
              src={preview}
              alt="Preview"
              className="max-w-xs max-h-64 rounded-lg border border-border object-cover"
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
          <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 5MB</p>
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
      />

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-4 h-4 border-2 border-muted-foreground border-t-primary rounded-full animate-spin" />
          Processing image...
        </div>
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
