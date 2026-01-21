"use client"

import { useState, useEffect } from "react"
import { Loader2, AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Post {
  id: string
  message?: string
  created_time: string
  type: string
  link?: string
  insights?: {
    impressions: number
    engaged_users: number
    post_engaged_users: number
    post_clicks: number
  }
}

interface Page {
  id: string
  name: string
}

export default function PostsPage() {
  const [pages, setPages] = useState<Page[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [selectedPage, setSelectedPage] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPages()
  }, [])

  useEffect(() => {
    if (selectedPage) {
      fetchPosts(selectedPage)
    }
  }, [selectedPage])

  const fetchPages = async () => {
    try {
      const response = await fetch("/api/facebook/accounts")
      const data = await response.json()

      if (data.success && data.accounts.length > 0) {
        const firstAccountId = data.accounts[0].id
        const accountResponse = await fetch(`/api/facebook/accounts/${firstAccountId}`)
        const accountData = await accountResponse.json()

        if (accountData.success) {
          setPages(accountData.pages)
          if (accountData.pages.length > 0) {
            setSelectedPage(accountData.pages[0].id)
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch pages")
    } finally {
      setLoading(false)
    }
  }

  const fetchPosts = async (pageId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/facebook/posts/${pageId}?limit=20`)
      const data = await response.json()

      if (data.success) {
        setPosts(data.posts)
      } else {
        setError(data.error || "Failed to fetch posts")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Page Posts</h1>
        <p className="text-muted-foreground mt-2">
          View and manage your Facebook page posts
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <select
              value={selectedPage}
              onChange={(e) => setSelectedPage(e.target.value)}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="">Select a page</option>
              {pages.map((page) => (
                <option key={page.id} value={page.id}>
                  {page.name}
                </option>
              ))}
            </select>

            <Button
              variant="outline"
              onClick={() => selectedPage && fetchPosts(selectedPage)}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          {posts.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No Posts Found</CardTitle>
                <CardDescription>
                  This page has no posts yet
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="grid gap-4">
              {posts.map((post) => (
                <Card key={post.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-2">
                          {new Date(post.created_time).toLocaleString()}
                        </p>
                        <p className="text-sm line-clamp-3">
                          {post.message || post.type}
                        </p>
                      </div>
                      {post.link && (
                        <a
                          href={post.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-500 hover:underline ml-4 flex-shrink-0"
                        >
                          View
                        </a>
                      )}
                    </div>
                  </CardHeader>
                  {post.insights && (
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Impressions</p>
                          <p className="text-lg font-semibold">
                            {post.insights.impressions?.toLocaleString() || "—"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Engaged Users</p>
                          <p className="text-lg font-semibold">
                            {post.insights.engaged_users?.toLocaleString() || "—"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Clicks</p>
                          <p className="text-lg font-semibold">
                            {post.insights.post_clicks?.toLocaleString() || "—"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Engagement Rate</p>
                          <p className="text-lg font-semibold">
                            {post.insights.impressions > 0
                              ? (
                                  ((post.insights.engaged_users ||
                                    post.insights.post_engaged_users ||
                                    0) /
                                    post.insights.impressions) *
                                  100
                                ).toFixed(2)
                              : "—"}
                            %
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
