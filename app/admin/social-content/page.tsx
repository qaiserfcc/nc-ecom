"use client"

import { useState, useMemo } from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
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
  Search,
  X,
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
  const [selectedProductName, setSelectedProductName] = useState<string>("")
  const [productSearch, setProductSearch] = useState<string>("")
  const [platform, setPlatform] = useState<"facebook" | "instagram" | "both">("both")
  const [contentType, setContentType] = useState<"promotional" | "educational" | "entertainment">("promotional")
  const [scheduleFor, setScheduleFor] = useState<string>("")
  const [promoOffer, setPromoOffer] = useState<string>("")

  const { data: contentData, isLoading: contentLoading, mutate: mutateContent } = useSWR(
    "/api/social-content?limit=50",
    fetcher
  )
  
  // Fetch products with search query - use debounced search to avoid excessive API calls
  const searchQuery = productSearch.trim() ? `&search=${encodeURIComponent(productSearch)}` : '';
  const { data: productsData, isLoading: productsLoading } = useSWR(
    productSearch.trim() ? `/api/products/minimal?limit=50${searchQuery}` : null,
    fetcher
  )

  // Use filtered products from API
  const filteredProducts = useMemo(() => {
    return productsData?.products || []
  }, [productsData?.products])
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
          promoOffer: promoOffer || null,
          userId: 1,
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
      setSelectedProductName("")
      setProductSearch("")
      setScheduleFor("")
      setPromoOffer("")
    } catch (error) {
      notify.error("Failed to generate content")
    } finally {
      setGenerating(false)
    }
  }

  const handleSelectProduct = (productId: string, productName: string) => {
    setSelectedProduct(productId)
    setSelectedProductName(productName)
    setProductSearch("")
  }

  const handleClearProduct = () => {
    setSelectedProduct("")
    setSelectedProductName("")
    setProductSearch("")
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

  // Check if there are active social accounts connected
  const hasActiveAccounts = accountsData?.data?.some((account: any) => account.is_active) || false
  const totalAccounts = accountsData?.data?.length || 0

  return (
    <div className="space-y-6">
      {/* Social Account Connection Banner */}
      {!hasActiveAccounts && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-orange-900 mb-1">
                  No Social Accounts Connected
                </h3>
                <p className="text-sm text-orange-800 mb-3">
                  Connect your Facebook and Instagram accounts to start posting AI-generated content to your social media.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-orange-300 hover:bg-orange-100"
                  onClick={() => setActiveTab("accounts")}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Connect Accounts
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Social Media Management</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-purple-600 hover:bg-purple-700">
              <Wand2 className="w-4 h-4" />
              Generate AI Content
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Generate Social Media Content</DialogTitle>
              <DialogDescription>
                Select a product and choose your content preferences to generate AI-powered social media content
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Product Selection with Search */}
              <div className="space-y-2">
                <Label htmlFor="product-search">Select Product</Label>
                {selectedProduct ? (
                  <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                    <span className="font-medium text-sm">{selectedProductName}</span>
                    <button
                      onClick={handleClearProduct}
                      className="p-1 hover:bg-gray-200 rounded"
                      title="Clear product selection"
                      aria-label="Clear product selection"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      id="product-search"
                      placeholder="Search products by name or ID..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                )}
                
                {!selectedProduct && productSearch && (
                  <ScrollArea className="h-64 border rounded-lg">
                    <div className="p-3 space-y-1">
                      {productsLoading ? (
                        <div className="flex justify-center py-8">
                          <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                        </div>
                      ) : filteredProducts.length > 0 ? (
                        filteredProducts.map((product: any) => (
                          <button
                            key={product.id}
                            onClick={() => handleSelectProduct(product.id.toString(), product.name)}
                            className="w-full text-left p-2 hover:bg-purple-100 rounded-lg transition-colors text-sm"
                          >
                            <div className="font-medium">{product.name}</div>
                            <div className="text-xs text-gray-500">ID: {product.id}</div>
                          </button>
                        ))
                      ) : (
                        <div className="text-sm text-gray-500 py-4 text-center">
                          No products found
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                )}
              </div>

              {/* Platform Selection */}
              <div className="space-y-2">
                <Label htmlFor="platform-select">Platform</Label>
                <Select value={platform} onValueChange={(v) => setPlatform(v as any)}>
                  <SelectTrigger id="platform-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="facebook">
                      <div className="flex items-center gap-2">
                        <Facebook className="w-4 h-4" />
                        Facebook
                      </div>
                    </SelectItem>
                    <SelectItem value="instagram">
                      <div className="flex items-center gap-2">
                        <Instagram className="w-4 h-4" />
                        Instagram
                      </div>
                    </SelectItem>
                    <SelectItem value="both">
                      <div className="flex items-center gap-2">
                        <Facebook className="w-3 h-3" />
                        <Instagram className="w-3 h-3" />
                        Both Platforms
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Content Type Selection */}
              <div className="space-y-2">
                <Label htmlFor="content-type-select">Content Type</Label>
                <Select value={contentType} onValueChange={(v) => setContentType(v as any)}>
                  <SelectTrigger id="content-type-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="promotional">📢 Promotional</SelectItem>
                    <SelectItem value="educational">📚 Educational</SelectItem>
                    <SelectItem value="entertainment">🎬 Entertainment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Schedule (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="schedule-date">Schedule For (Optional)</Label>
                <Input
                  id="schedule-date"
                  type="datetime-local"
                  value={scheduleFor}
                  onChange={(e) => setScheduleFor(e.target.value)}
                />
              </div>

              {/* Promo Offer (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="promo-offer">Promo Offer (Optional)</Label>
                <Input
                  id="promo-offer"
                  placeholder="e.g., 20% OFF or Free Shipping"
                  value={promoOffer}
                  onChange={(e) => setPromoOffer(e.target.value)}
                />
              </div>

              {/* Generate Button */}
              <Button 
                onClick={handleGenerateContent} 
                disabled={generating || !selectedProduct} 
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Generate Content
                  </>
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
                <div className="text-center py-12 space-y-4">
                  <div className="flex justify-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Facebook className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <Instagram className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">No Connected Accounts</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Connect your Facebook and Instagram accounts to enable automated social media posting. 
                    You'll need to authenticate through Facebook's OAuth to connect your accounts.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-lg mx-auto text-left">
                    <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      How to Connect Accounts
                    </h4>
                    <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
                      <li>Ensure you have admin access to your Facebook Page</li>
                      <li>For Instagram, make sure it's a Business or Creator account linked to Facebook</li>
                      <li>Set up Facebook App credentials in your environment variables</li>
                      <li>Use the social accounts API to add your account credentials</li>
                    </ol>
                  </div>
                </div>
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
