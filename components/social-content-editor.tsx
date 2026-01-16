"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  Eye,
  Send,
  Loader2,
  Copy,
  Download,
  Info,
  AlertCircle,
  Heart,
  MessageCircle,
  Share2,
  Maximize2,
} from "lucide-react"
import { notify } from "@/lib/utils/notifications"

interface ContentEditorProps {
  initialContent?: {
    id: number
    title: string
    content: string
    platform: string
    hashtags?: string
    status: string
  }
  onSave?: (data: any) => void
  isEditing?: boolean
}

export function ContentEditor({ initialContent, onSave, isEditing }: ContentEditorProps) {
  const [title, setTitle] = useState(initialContent?.title || "")
  const [content, setContent] = useState(initialContent?.content || "")
  const [hashtags, setHashtags] = useState(initialContent?.hashtags || "")
  const [platform, setPlatform] = useState(initialContent?.platform || "instagram")
  const [characterCount, setCharacterCount] = useState(initialContent?.content.length || 0)
  const [previewMode, setPreviewMode] = useState(false)
  const [adMode, setAdMode] = useState(false)
  const [adBudget, setAdBudget] = useState("")
  const [targetAudience, setTargetAudience] = useState("")
  const [posting, setPosting] = useState(false)

  const MAX_CHARS = platform === "instagram" ? 2200 : 5000
  const RECOMMENDED_CHARS = platform === "instagram" ? 150 : 280

  useEffect(() => {
    setCharacterCount(content.length)
  }, [content])

  const handleHashtagAdd = (tag: string) => {
    if (tag && !hashtags.includes(tag)) {
      setHashtags((prev) => (prev ? `${prev} ${tag}` : tag))
    }
  }

  const handleCopyContent = () => {
    navigator.clipboard.writeText(`${title}\n\n${content}\n\n${hashtags}`)
    notify({ type: "success", message: "Content copied to clipboard" })
  }

  const handlePostToSocial = async () => {
    if (!content.trim()) {
      notify({ type: "error", message: "Content cannot be empty" })
      return
    }

    setPosting(true)
    try {
      const response = await fetch("/api/social-content/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentId: initialContent?.id,
          action: "post",
          platforms: [platform],
        }),
      })

      if (!response.ok) throw new Error("Failed to post")

      const result = await response.json()
      notify({ type: "success", message: "Posted successfully!" })
      onSave?.(result)
    } catch (error) {
      notify({ type: "error", message: "Failed to post content" })
    } finally {
      setPosting(false)
    }
  }

  const platformLimits = {
    instagram: { max: 2200, recommended: 150 },
    facebook: { max: 5000, recommended: 280 },
  }

  const limits = platformLimits[platform as keyof typeof platformLimits] || platformLimits.instagram

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {/* Title Input */}
        <div>
          <Label htmlFor="title">Post Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter post title..."
            maxLength={255}
          />
          <p className="text-xs text-muted-foreground mt-1">{title.length}/255 characters</p>
        </div>

        {/* Platform Selection */}
        <div>
          <Label htmlFor="platform">Platform</Label>
          <Select value={platform} onValueChange={setPlatform}>
            <SelectTrigger id="platform">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="facebook">Facebook</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Main Content */}
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="content">Content</Label>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPreviewMode(!previewMode)}
                className="gap-2"
              >
                <Eye className="w-4 h-4" />
                {previewMode ? "Edit" : "Preview"}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleCopyContent} className="gap-2">
                <Copy className="w-4 h-4" />
                Copy
              </Button>
            </div>
          </div>

          {previewMode ? (
            <Card className="bg-slate-50">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {platform === "instagram" && (
                    <div className="bg-white rounded-lg border p-4 max-w-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full" />
                        <p className="font-semibold text-sm">Your Business</p>
                      </div>
                      <p className="text-sm mb-3">{title}</p>
                      <p className="text-sm text-gray-600 mb-3">{content}</p>
                      <p className="text-sm text-blue-500 mb-3">{hashtags}</p>
                      <div className="flex gap-4 text-sm text-gray-500">
                        <button className="flex items-center gap-1 hover:text-red-500">
                          <Heart className="w-4 h-4" /> Like
                        </button>
                        <button className="flex items-center gap-1 hover:text-blue-500">
                          <MessageCircle className="w-4 h-4" /> Comment
                        </button>
                        <button className="flex items-center gap-1 hover:text-blue-500">
                          <Share2 className="w-4 h-4" /> Share
                        </button>
                      </div>
                    </div>
                  )}

                  {platform === "facebook" && (
                    <div className="bg-white rounded-lg border p-4 max-w-md">
                      <div className="flex items-center gap-2 mb-3 pb-3 border-b">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full" />
                        <div>
                          <p className="font-semibold text-sm">Your Business</p>
                          <p className="text-xs text-gray-500">Just now</p>
                        </div>
                      </div>
                      <p className="text-sm font-semibold mb-2">{title}</p>
                      <p className="text-sm mb-3">{content}</p>
                      <p className="text-sm text-blue-500 mb-3">{hashtags}</p>
                      <div className="flex justify-between text-xs text-gray-500 pb-2 border-b">
                        <button className="hover:underline">Like</button>
                        <button className="hover:underline">Comment</button>
                        <button className="hover:underline">Share</button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your content here..."
              maxLength={limits.max}
              rows={6}
              className="resize-none"
            />
          )}

          <div className="mt-2 flex justify-between items-center">
            <p
              className={`text-xs ${
                characterCount > limits.max
                  ? "text-red-500"
                  : characterCount > limits.recommended
                    ? "text-yellow-500"
                    : "text-muted-foreground"
              }`}
            >
              {characterCount}/{limits.max} characters
              {characterCount < limits.recommended && (
                <span className="text-gray-500 ml-2">
                  (Recommended: {limits.recommended}+)
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Hashtags */}
        <div>
          <Label htmlFor="hashtags">Hashtags</Label>
          <div className="mb-2 flex flex-wrap gap-2">
            {hashtags.split(" ").filter(Boolean).map((tag, idx) => (
              <Badge key={idx} variant="secondary" className="flex gap-1 cursor-pointer">
                {tag}
                <button
                  onClick={() =>
                    setHashtags(
                      hashtags
                        .split(" ")
                        .filter((t) => t !== tag)
                        .join(" ")
                    )
                  }
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
          <Input
            id="hashtags"
            value={hashtags}
            onChange={(e) => setHashtags(e.target.value)}
            placeholder="Add hashtags (space separated)..."
          />
          <p className="text-xs text-muted-foreground mt-1">
            {hashtags.split(" ").filter(Boolean).length} hashtags
          </p>
        </div>

        {/* Ad Mode */}
        <div className="border rounded-lg p-4 space-y-4">
          <div className="flex items-center gap-2">
            <Switch
              checked={adMode}
              onCheckedChange={setAdMode}
              id="ad-mode"
            />
            <Label htmlFor="ad-mode" className="cursor-pointer flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Enable Paid Ad / Free Promotion
            </Label>
          </div>

          {adMode && (
            <div className="space-y-3">
              <div>
                <Label htmlFor="ad-budget">Budget (Optional - for Paid Ads)</Label>
                <Input
                  id="ad-budget"
                  type="number"
                  value={adBudget}
                  onChange={(e) => setAdBudget(e.target.value)}
                  placeholder="Enter budget amount..."
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <Label htmlFor="target-audience">Target Audience</Label>
                <Select value={targetAudience} onValueChange={setTargetAudience}>
                  <SelectTrigger id="target-audience">
                    <SelectValue placeholder="Select audience..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="18-24">18-24 years</SelectItem>
                    <SelectItem value="25-34">25-34 years</SelectItem>
                    <SelectItem value="35-44">35-44 years</SelectItem>
                    <SelectItem value="45-54">45-54 years</SelectItem>
                    <SelectItem value="55+">55+ years</SelectItem>
                    <SelectItem value="all">All ages</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800 flex gap-2">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Free Promotion: No budget required</p>
                  <p className="text-xs mt-1">
                    Leave budget empty to create a free promotional post on your business page
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 justify-end">
        {isEditing && (
          <Button variant="outline" onClick={() => onSave?.({ action: "draft" })}>
            Save as Draft
          </Button>
        )}
        <Button
          onClick={handlePostToSocial}
          disabled={posting || !content.trim()}
          className="gap-2"
        >
          {posting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Posting...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Post Now
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
