"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Loader2, AlertCircle, ArrowLeft, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface AdAccount {
  id: string
  name: string
  status: string
}

interface Page {
  id: string
  name: string
  url?: string
}

interface AccountDetails {
  adAccounts: AdAccount[]
  pages: Page[]
}

export default function AccountDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const accountId = params.accountId as string

  const [details, setDetails] = useState<AccountDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAccountDetails()
  }, [accountId])

  const fetchAccountDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/facebook/accounts/${accountId}`)
      const data = await response.json()

      if (data.success) {
        setDetails({
          adAccounts: data.adAccounts || [],
          pages: data.pages || [],
        })
      } else {
        setError(data.error || "Failed to fetch account details")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Account Details</h1>
          <p className="text-muted-foreground mt-1">ID: {accountId}</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {details && (
        <Tabs defaultValue="ad-accounts" className="w-full">
          <TabsList>
            <TabsTrigger value="ad-accounts">
              Ad Accounts ({details.adAccounts.length})
            </TabsTrigger>
            <TabsTrigger value="pages">
              Pages ({details.pages.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ad-accounts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Ad Accounts</CardTitle>
                <CardDescription>
                  {details.adAccounts.length === 0
                    ? "No ad accounts found for this business account"
                    : `${details.adAccounts.length} ad account(s) available`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {details.adAccounts.length === 0 ? (
                  <p className="text-muted-foreground">
                    No ad accounts connected. Check your Facebook token permissions.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {details.adAccounts.map((account) => (
                      <div
                        key={account.id}
                        className="flex items-start justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{account.name}</p>
                          <p className="text-sm text-muted-foreground">{account.id}</p>
                          <p className="text-sm mt-2">
                            Status: <span className="font-medium capitalize">{account.status}</span>
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            router.push(
                              `/admin/facebook/campaigns?adAccountId=${account.id}`
                            )
                          }
                        >
                          View Campaigns
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pages" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Facebook Pages</CardTitle>
                <CardDescription>
                  {details.pages.length === 0
                    ? "No pages found for this business account"
                    : `${details.pages.length} page(s) available`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {details.pages.length === 0 ? (
                  <p className="text-muted-foreground">
                    No pages found. Check your Facebook token permissions.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {details.pages.map((page) => (
                      <div
                        key={page.id}
                        className="flex items-start justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{page.name}</p>
                          <p className="text-sm text-muted-foreground">{page.id}</p>
                          {page.url && (
                            <a
                              href={page.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-500 hover:underline mt-2"
                            >
                              View on Facebook →
                            </a>
                          )}
                        </div>
                        <div className="space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              router.push(`/admin/facebook/leads?pageId=${page.id}`)
                            }
                          >
                            View Leads
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              router.push(`/admin/facebook/posts?pageId=${page.id}`)
                            }
                          >
                            View Posts
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Refresh Button */}
      <Button
        variant="outline"
        onClick={fetchAccountDetails}
        className="gap-2"
      >
        <RefreshCw className="h-4 w-4" />
        Refresh Data
      </Button>
    </div>
  )
}
