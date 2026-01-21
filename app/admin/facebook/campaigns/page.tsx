"use client"

import { useState, useEffect } from "react"
import { Loader2, AlertCircle, RefreshCw, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Campaign {
  id: string
  name: string
  objective: string
  status: string
  budget?: {
    amount: number
    type: string
  }
  created_time: string
  insights?: {
    impressions: number
    clicks: number
    spend: number
  }
}

interface AdAccount {
  id: string
  name: string
}

export default function CampaignsPage() {
  const [adAccounts, setAdAccounts] = useState<AdAccount[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [selectedAccount, setSelectedAccount] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newCampaign, setNewCampaign] = useState({ name: "", objective: "REACH" })
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetchAdAccounts()
  }, [])

  useEffect(() => {
    if (selectedAccount) {
      fetchCampaigns(selectedAccount)
    }
  }, [selectedAccount])

  const fetchAdAccounts = async () => {
    try {
      const response = await fetch("/api/facebook/accounts")
      const data = await response.json()

      if (data.success && data.accounts.length > 0) {
        const firstAccountId = data.accounts[0].id
        const accountResponse = await fetch(`/api/facebook/accounts/${firstAccountId}`)
        const accountData = await accountResponse.json()

        if (accountData.success) {
          setAdAccounts(accountData.adAccounts)
          if (accountData.adAccounts.length > 0) {
            setSelectedAccount(accountData.adAccounts[0].id)
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch accounts")
    } finally {
      setLoading(false)
    }
  }

  const fetchCampaigns = async (adAccountId: string) => {
    try {
      setLoading(true)
      const response = await fetch(
        `/api/facebook/campaigns/${adAccountId}?status=ACTIVE,PAUSED`
      )
      const data = await response.json()

      if (data.success) {
        setCampaigns(data.campaigns)
      } else {
        setError(data.error || "Failed to fetch campaigns")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCampaign = async () => {
    if (!newCampaign.name) {
      setError("Campaign name is required")
      return
    }

    try {
      setCreating(true)
      const response = await fetch(`/api/facebook/campaigns/${selectedAccount}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCampaign),
      })

      const data = await response.json()
      if (data.success) {
        setShowCreateDialog(false)
        setNewCampaign({ name: "", objective: "REACH" })
        fetchCampaigns(selectedAccount)
      } else {
        setError(data.error || "Failed to create campaign")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Ad Campaigns</h1>
        <p className="text-muted-foreground mt-2">
          Manage your Facebook ad campaigns and performance
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
            <Select value={selectedAccount} onValueChange={setSelectedAccount}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select an ad account" />
              </SelectTrigger>
              <SelectContent>
                {adAccounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Campaign
            </Button>

            <Button
              variant="outline"
              onClick={() => selectedAccount && fetchCampaigns(selectedAccount)}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          {campaigns.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No Campaigns Found</CardTitle>
                <CardDescription>
                  Create a new campaign to get started with Facebook ads
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="grid gap-4">
              {campaigns.map((campaign) => (
                <Card key={campaign.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{campaign.name}</CardTitle>
                        <CardDescription>{campaign.objective}</CardDescription>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          campaign.status === "ACTIVE"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {campaign.status}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Impressions</p>
                        <p className="text-2xl font-bold">
                          {campaign.insights?.impressions.toLocaleString() || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Clicks</p>
                        <p className="text-2xl font-bold">
                          {campaign.insights?.clicks.toLocaleString() || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Spend</p>
                        <p className="text-2xl font-bold">
                          ${campaign.insights?.spend.toFixed(2) || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Created</p>
                        <p className="text-sm font-medium">
                          {new Date(campaign.created_time).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Campaign</DialogTitle>
            <DialogDescription>Create a new Facebook ad campaign</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="campaign-name">Campaign Name</Label>
              <Input
                id="campaign-name"
                value={newCampaign.name}
                onChange={(e) =>
                  setNewCampaign({ ...newCampaign, name: e.target.value })
                }
                placeholder="Enter campaign name"
              />
            </div>

            <div>
              <Label htmlFor="objective">Campaign Objective</Label>
              <Select
                value={newCampaign.objective}
                onValueChange={(value) =>
                  setNewCampaign({ ...newCampaign, objective: value })
                }
              >
                <SelectTrigger id="objective">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="REACH">Reach</SelectItem>
                  <SelectItem value="CONVERSIONS">Conversions</SelectItem>
                  <SelectItem value="VIDEO_VIEWS">Video Views</SelectItem>
                  <SelectItem value="TRAFFIC">Traffic</SelectItem>
                  <SelectItem value="BRAND_AWARENESS">Brand Awareness</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateCampaign}
                disabled={creating}
              >
                {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Campaign
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
