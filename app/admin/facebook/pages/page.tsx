"use client"

import { useState, useEffect } from "react"
import { Loader2, AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface PageData {
  id: string
  name: string
  category?: string
  followers_count?: number
  picture?: {
    data: {
      url: string
    }
  }
}

export default function PagesPage() {
  const [pages, setPages] = useState<PageData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPages()
  }, [])

  const fetchPages = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/facebook/accounts")
      const data = await response.json()

      if (data.success && data.accounts.length > 0) {
        const firstAccountId = data.accounts[0].id
        const accountResponse = await fetch(`/api/facebook/accounts/${firstAccountId}`)
        const accountData = await accountResponse.json()

        if (accountData.success) {
          setPages(accountData.pages)
        } else {
          setError(accountData.error || "Failed to fetch pages")
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch pages")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Facebook Pages</h1>
        <p className="text-muted-foreground mt-2">
          Manage your connected Facebook pages
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
      ) : pages.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Pages Connected</CardTitle>
            <CardDescription>
              Connect your Facebook pages to manage them here
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={fetchPages}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {pages.map((page) => (
            <Card key={page.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{page.name}</CardTitle>
                    <CardDescription>{page.category || "Page"}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Page ID</p>
                    <p className="font-mono text-sm">{page.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Followers</p>
                    <p className="text-lg font-semibold">
                      {page.followers_count?.toLocaleString() || "—"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        window.location.href = `/admin/facebook/leads`
                      }
                    >
                      View Leads
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        window.location.href = `/admin/facebook/posts`
                      }
                    >
                      View Posts
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
