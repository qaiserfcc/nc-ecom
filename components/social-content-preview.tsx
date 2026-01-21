"use client"

import { useState } from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Facebook,
  Instagram,
  Share2,
  Send,
  Image,
  Video,
  Loader2,
  CheckCircle,
  AlertCircle,
  FileText,
} from "lucide-react"
import { notify } from "@/lib/utils/notifications"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface FormatContent {
  id: number
  social_content_id: number
  platform: "facebook" | "instagram"
  format: "post" | "story" | "reel"
  content: string
  title?: string
  hashtags?: string[]
  cta?: string
  media_url?: string
  media_type?: "image" | "video"
  status: "draft" | "posted" | "failed"
  posted_at?: string
  external_id?: string
  error_message?: string
}

interface SocialContentDetail {
  id: number
  product_id: number
  platform: string
  title: string
  content: string
  media_url?: string
  media_type?: string
  formats: FormatContent[]
  status: string
  created_at: string
}

const formatIcons: Record<string, React.ReactNode> = {
  post: <FileText className="w-4 h-4" />,
  story: <Image className="w-4 h-4" />,
  reel: <Video className="w-4 h-4" />,
}

const platformColors: Record<string, string> = {
  facebook: "bg-blue-100 text-blue-800",
  instagram: "bg-purple-100 text-purple-800",
}

const platformIcons: Record<string, React.ReactNode> = {
  facebook: <Facebook className="w-4 h-4" />,
  instagram: <Instagram className="w-4 h-4" />,
}

function FormatPreview({ format }: { format: FormatContent }) {
  const [posting, setPosting] = useState(false)

  const handlePost = async () => {
    setPosting(true)
    try {
      const response = await fetch('/api/social-content/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentId: format.social_content_id,
          formatId: format.id,
          platform: format.platform,
          format: format.format,
        }),
      })

      const data = await response.json()
      if (response.ok) {
        notify.success(`Posted ${format.format} to ${format.platform}`)
      } else {
        notify.error(data.error || 'Failed to post')
      }
    } catch (error) {
      notify.error('Error posting content')
    } finally {
      setPosting(false)
    }
  }

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded ${platformColors[format.platform]}`}>
              {platformIcons[format.platform]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold capitalize">{format.format}</p>
                {formatIcons[format.format]}
              </div>
              <p className="text-xs text-gray-600">{format.platform}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={format.status === 'posted' ? 'default' : 'secondary'}
              className={format.status === 'posted' ? 'bg-green-600' : 'bg-yellow-600'}
            >
              {format.status === 'posted' ? (
                <CheckCircle className="w-3 h-3 mr-1" />
              ) : (
                <FileText className="w-3 h-3 mr-1" />
              )}
              {format.status}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Media Preview */}
        {format.media_url && (
          <div className="border rounded-lg overflow-hidden bg-gray-100 h-48 flex items-center justify-center relative">
            {format.media_type === 'video' ? (
              <>
                <img
                  src={format.media_url}
                  alt={format.format}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                    const parent = e.currentTarget.parentElement
                    if (parent) {
                      const icon = parent.querySelector('.video-icon-fallback')
                      if (icon) icon.classList.remove('hidden')
                    }
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-black bg-opacity-50 rounded-full p-3">
                    <Video className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="absolute bottom-2 left-2 right-2">
                  <Badge variant="secondary" className="text-xs">
                    Video Thumbnail Preview
                  </Badge>
                </div>
                <Video className="w-12 h-12 text-gray-400 video-icon-fallback hidden" />
              </>
            ) : (
              <img
                src={format.media_url}
                alt={format.format}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            )}
          </div>
        )}

        {/* Content */}
        <div className="space-y-2">
          {format.title && (
            <div>
              <p className="text-xs font-semibold text-gray-600">TITLE</p>
              <p className="text-sm">{format.title}</p>
            </div>
          )}

          <div>
            <p className="text-xs font-semibold text-gray-600">CONTENT</p>
            <p className="text-sm whitespace-pre-wrap bg-gray-50 p-3 rounded border">
              {format.content}
            </p>
          </div>

          {(() => {
            let hashtags: string[] = []
            
            if (Array.isArray(format.hashtags)) {
              hashtags = format.hashtags
            } else if (typeof format.hashtags === 'string') {
              try {
                // Try parsing as JSON array first
                hashtags = JSON.parse(format.hashtags);
              } catch {
                // Fall back to splitting by space or comma
                hashtags = format.hashtags.split(/[\s,#]+/).filter(Boolean)
              }
            }

            return hashtags.length > 0 ? (
              <div>
                <p className="text-xs font-semibold text-gray-600">HASHTAGS</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {hashtags.map((tag, i) => (
                    <Badge key={i} variant="outline">
                      #{String(tag).startsWith('#') ? String(tag).slice(1) : String(tag)}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null
          })()}

          {format.cta && (
            <div>
              <p className="text-xs font-semibold text-gray-600">CTA</p>
              <p className="text-sm font-medium text-blue-600">{format.cta}</p>
            </div>
          )}
        </div>

        {/* Post Button */}
        {format.status === 'draft' && (
          <Button
            onClick={handlePost}
            disabled={posting}
            className="w-full mt-4"
          >
            {posting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Posting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Post to {format.platform}
              </>
            )}
          </Button>
        )}

        {format.status === 'posted' && (
          <div className="flex items-center gap-2 p-2 bg-green-50 rounded text-green-700 text-sm">
            <CheckCircle className="w-4 h-4" />
            Posted on {format.posted_at ? new Date(format.posted_at).toLocaleDateString() : 'unknown date'}
          </div>
        )}

        {format.error_message && (
          <div className="flex items-center gap-2 p-2 bg-red-50 rounded text-red-700 text-sm">
            <AlertCircle className="w-4 h-4" />
            {format.error_message}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function ContentPreviewDialog({ contentId, isOpen, onClose }: { contentId: number; isOpen: boolean; onClose: () => void }) {
  const { data: content, isLoading } = useSWR(
    isOpen ? `/api/social-content/generate?id=${contentId}` : null,
    fetcher,
    { revalidateOnFocus: false }
  )

  if (!content && isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Loading content...</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const facebookFormats = content?.formats?.filter((f: FormatContent) => f.platform === 'facebook') || []
  const instagramFormats = content?.formats?.filter((f: FormatContent) => f.platform === 'instagram') || []

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Content Preview & Posting</DialogTitle>
          <DialogDescription>
            View format-specific content and post individually to each platform
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="facebook" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="facebook" className="flex items-center gap-2">
              <Facebook className="w-4 h-4" />
              Facebook
            </TabsTrigger>
            <TabsTrigger value="instagram" className="flex items-center gap-2">
              <Instagram className="w-4 h-4" />
              Instagram
            </TabsTrigger>
          </TabsList>

          <TabsContent value="facebook" className="space-y-4 mt-4">
            {facebookFormats.length > 0 ? (
              facebookFormats.map((format: FormatContent) => (
                <FormatPreview key={format.id} format={format} />
              ))
            ) : (
              <div className="text-center py-8 text-gray-600">
                No Facebook content available
              </div>
            )}
          </TabsContent>

          <TabsContent value="instagram" className="space-y-4 mt-4">
            {instagramFormats.length > 0 ? (
              instagramFormats.map((format: FormatContent) => (
                <FormatPreview key={format.id} format={format} />
              ))
            ) : (
              <div className="text-center py-8 text-gray-600">
                No Instagram content available
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
