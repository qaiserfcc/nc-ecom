"use client"

import { useState } from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Plus,
  Trash2,
  Eye,
  Loader2,
  Wand2,
  BarChart3,
  Facebook,
  Instagram,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react"
import { ContentPreviewDialog } from "@/components/social-content-preview"
import { notify } from "@/lib/utils/notifications"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function AdminSocialContentPage() {
  const [activeTab, setActiveTab] = useState("content")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewContentId, setPreviewContentId] = useState<number | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<string>("")
  const [platform, setPlatform] = useState<"facebook" | "instagram" | "both">("both")
  const [contentType, setContentType] = useState<"promotional" | "educational" | "entertainment">("promotional")
  const [scheduleFor, setScheduleFor] = useState<string>("")

  const { data: contentData, isLoading: contentLoading, mutate: mutateContent } = useSWR(
    "/api/social-content?limit=50",
    fetcher
  )
  const { data: productsData } = useSWR("/api/products?limit=100", fetcher)
  const { data: accountsData } = useSWR("/api/social-accounts", fetcher)

  const handleGenerateContent = async () => {
    if (!selectedProduct) {
      notify.error("Please select a product")
      return
    }

    setGenerating(true)
    try {
      const response = await fetch("/api/social-content/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: parseInt(selectedProduct),
          action: "generate",
          contentType,
          scheduleFor: scheduleFor || null,
          userId: 1, // Replace with actual user ID
        }),
      })

      if (!response.ok) throw new Error("Failed to generate content")

      const data = await response.json()
      
      notify.success("Content generated successfully!")
      await mutateContent()
      
      // Open preview dialog
      setPreviewContentId(data.id)
      setPreviewOpen(true)
      
      // Reset form
      setDialogOpen(false)
      setSelectedProduct("")
      setScheduleFor("")
      setSelectedProduct("")
    } catch (error) {
      notify.error("Failed to generate content")
    } finally {
      setGenerating(false)
    }
  }

  const handleDeleteContent = async (id: number) => {
    try {
      const response = await fetch(`/api/social-content?id=${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete content")

      await mutateContent()
      notify.success("Content deleted successfully!")
      setDeleteId(null)
    } catch (error) {
      notify.error("Failed to delete content")
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "posted":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "scheduled":
        return <Clock className="w-4 h-4 text-blue-500" />
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
    }
  }

  const getPlatformIcon = (platform: string) => {
    return platform === "facebook" ? (
      <Facebook className="w-4 h-4" />
    ) : platform === "instagram" ? (
      <Instagram className="w-4 h-4" />
    ) : (
      <div className="flex gap-1">
        <Facebook className="w-3 h-3" />
        <Instagram className="w-3 h-3" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Social Media Management</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Wand2 className="w-4 h-4" />
              Generate AI Content
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Generate Social Media Content</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="product-select">Select Product</Label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger id="product-select">
                    <SelectValue placeholder="Choose a product..." />
                  </SelectTrigger>
                  <SelectContent>
                    {productsData?.products?.map((product: any) => (
                      <SelectItem key={product.id} value={product.id.toString()}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="platform-select">Platform</Label>
                <Select value={platform} onValueChange={(v) => setPlatform(v as any)}>
                  <SelectTrigger id="platform-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="both">Both Platforms</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="content-type-select">Content Type</Label>
                <Select value={contentType} onValueChange={(v) => setContentType(v as any)}>
                  <SelectTrigger id="content-type-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="promotional">Promotional</SelectItem>
                    <SelectItem value="educational">Educational</SelectItem>
                    <SelectItem value="entertainment">Entertainment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="schedule-date">Schedule For (Optional)</Label>
                <Input
                  id="schedule-date"
                  type="datetime-local"
                  value={scheduleFor}
                  onChange={(e) => setScheduleFor(e.target.value)}
                />
              </div>

              <Button onClick={handleGenerateContent} disabled={generating} className="w-full">
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Generating...
                  </>
                ) : (
                  "Generate Content"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="content">Generated Content</TabsTrigger>
          <TabsTrigger value="accounts">Connected Accounts</TabsTrigger>
          <TabsTrigger value="automation">Automation Schedule</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generated Social Content</CardTitle>
            </CardHeader>
            <CardContent>
              {contentLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Platform</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Scheduled</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contentData?.data?.map((item: any) => (
                        <TableRow key={item.id}>
                          <TableCell className="max-w-xs truncate">{item.title}</TableCell>
                          <TableCell className="flex gap-2">
                            {getPlatformIcon(item.platform)}
                            {item.platform}
                          </TableCell>
                          <TableCell className="flex gap-2">
                            {getStatusIcon(item.status)}
                            <Badge variant={item.status === "posted" ? "default" : "outline"}>
                              {item.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(item.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            {item.scheduled_at ? (
                              new Date(item.scheduled_at).toLocaleDateString()
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setPreviewContentId(item.id)
                                  setPreviewOpen(true)
                                }}
                                className="text-blue-500 hover:text-blue-700"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteId(item.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accounts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Connected Social Accounts</CardTitle>
            </CardHeader>
            <CardContent>
              {accountsData?.data?.length ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {accountsData.data.map((account: any) => (
                    <Card key={account.id} className="bg-slate-50">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              {getPlatformIcon(account.platform)}
                              <span className="font-semibold">{account.account_name}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{account.account_id}</p>
                            <p className="text-sm mt-2">
                              <span className="font-medium">{account.followers_count}</span> followers
                            </p>
                          </div>
                          <Badge variant={account.is_active ? "default" : "secondary"}>
                            {account.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No connected accounts yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Automation Schedules</CardTitle>
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create Schedule
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                Automation schedules will be created here
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Total Posts</p>
                      <p className="text-2xl font-bold">{contentData?.data?.length || 0}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Posted</p>
                      <p className="text-2xl font-bold text-green-500">
                        {contentData?.data?.filter((c: any) => c.status === "posted").length || 0}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Scheduled</p>
                      <p className="text-2xl font-bold text-blue-500">
                        {contentData?.data?.filter((c: any) => c.status === "scheduled").length || 0}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Drafts</p>
                      <p className="text-2xl font-bold text-yellow-500">
                        {contentData?.data?.filter((c: any) => c.status === "draft").length || 0}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Content</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this social content? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDeleteContent(deleteId)}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {previewContentId && (
        <ContentPreviewDialog
          contentId={previewContentId}
          isOpen={previewOpen}
          onClose={() => {
            setPreviewOpen(false)
            setPreviewContentId(null)
          }}
        />
      )}
    </div>
  )
}
