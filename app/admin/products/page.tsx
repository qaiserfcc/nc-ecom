"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Pencil, Trash2, Loader2, Upload, ChevronLeft, ChevronRight } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { notify } from "@/lib/utils/notifications"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function AdminProductsPage() {
  const [search, setSearch] = useState("")
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [bulkOpen, setBulkOpen] = useState(false)
  const [bulkSaving, setBulkSaving] = useState(false)
  const [featureStatus, setFeatureStatus] = useState<"no-change" | "true" | "false">("no-change")
  const [newArrivalStatus, setNewArrivalStatus] = useState<"no-change" | "true" | "false">("no-change")
  const [bulkCategoryId, setBulkCategoryId] = useState("no-change")
  const [bulkBrandId, setBulkBrandId] = useState("no-change")
  const [optimizingImages, setOptimizingImages] = useState(false)
  const itemsPerPage = 12

  const { data, isLoading, mutate } = useSWR(
    `/api/products?search=${search}&limit=${itemsPerPage}&offset=${(currentPage - 1) * itemsPerPage}`,
    fetcher
  )

  const { data: categoriesData } = useSWR("/api/categories", fetcher)
  const { data: brandsData } = useSWR("/api/brands", fetcher)

  const products = data?.products || []
  const total = data?.pagination?.total || 0
  const totalPages = Math.ceil(total / itemsPerPage)
  const categories = categoriesData?.categories || []
  const brands = brandsData?.brands || []

  const allSelected = products.length > 0 && selectedIds.length === products.length

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(products.map((p: any) => p.id))
    } else {
      setSelectedIds([])
    }
  }

  const toggleSelect = (id: number, checked: boolean) => {
    setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((pid) => pid !== id)))
  }

  const resetBulkForm = () => {
    setFeatureStatus("no-change")
    setNewArrivalStatus("no-change")
    setBulkCategoryId("no-change")
    setBulkBrandId("no-change")
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/products/${deleteId}`, { method: "DELETE" })
      if (!res.ok) {
        const error = await res.json()
        notify.error(error.error || "Failed to delete product")
        return
      }
      notify.success("Product deleted successfully")
      await mutate()
    } catch (error) {
      notify.error("Failed to delete product")
      console.error("Delete error:", error)
    } finally {
      setDeleting(false)
      setDeleteId(null)
    }
  }

  const handleBulkSave = async () => {
    if (selectedIds.length === 0) {
      notify.warning("Select products", "Choose products to bulk edit")
      return
    }

    const payload: any = { ids: selectedIds }
    if (featureStatus !== "no-change") payload.is_featured = featureStatus === "true"
    if (newArrivalStatus !== "no-change") payload.is_new_arrival = newArrivalStatus === "true"
    if (bulkCategoryId !== "no-change") payload.category_id = Number.parseInt(bulkCategoryId)
    if (bulkBrandId !== "no-change") payload.brand_id = Number.parseInt(bulkBrandId)

    if (Object.keys(payload).length === 1) {
      notify.warning("No changes selected", "Choose at least one field to update")
      return
    }

    setBulkSaving(true)
    try {
      const res = await fetch("/api/products/bulk", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to update products")
      }

      notify.success("Products updated", "Bulk changes applied")
      setBulkOpen(false)
      resetBulkForm()
      setSelectedIds([])
      await mutate()
    } catch (error) {
      notify.error("Bulk update failed", error instanceof Error ? error.message : "Please try again")
    } finally {
      setBulkSaving(false)
    }
  }

  const handleOptimizeImages = async () => {
    setOptimizingImages(true)
    try {
      const res = await fetch("/api/products/optimize-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to optimize images")
      }

      const result = await res.json()
      if (result.success) {
        notify.success(
          "Image optimization complete",
          `Converted ${result.results.productsProcessed} product images and ${result.results.productImagesProcessed} gallery images`
        )
        if (result.results.errors.length > 0) {
          notify.warning("Some images had errors", `${result.results.errors.length} items failed`)
        }
        await mutate()
      } else {
        throw new Error(result.error || "Optimization failed")
      }
    } catch (error) {
      notify.error("Image optimization failed", error instanceof Error ? error.message : "Please try again")
    } finally {
      setOptimizingImages(false)
    }
  }


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleOptimizeImages}
            disabled={optimizingImages}
          >
            {optimizingImages ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Upload className="w-4 h-4 mr-2" />
            )}
            {optimizingImages ? "Optimizing..." : "Optimize Images/Thumbs"}
          </Button>
          <Button
            variant="secondary"
            disabled={selectedIds.length === 0}
            onClick={() => {
              resetBulkForm()
              setBulkOpen(true)
            }}
          >
            Bulk Edit{selectedIds.length > 0 ? ` (${selectedIds.length})` : ""}
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/products/bulk">
              <Upload className="w-4 h-4 mr-2" />
              Bulk Upload
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/products/new">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Link>
          </Button>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setCurrentPage(1)
          }}
          className="pl-10"
        />
      </div>

      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between rounded-md border bg-muted/40 px-3 py-2 text-sm">
          <p className="text-muted-foreground">{selectedIds.length} selected</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setBulkOpen(true)}>
              Bulk Edit
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setSelectedIds([])}>
              Clear
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : products.length === 0 ? (
        <Card>
          <CardContent className="py-20 text-center">
            <p className="text-muted-foreground mb-4">No products found</p>
            <Button asChild>
              <Link href="/admin/products/new">Add Your First Product</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="w-full overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox
                        aria-label="Select all products"
                        checked={selectedIds.length > 0 ? (allSelected ? true : "indeterminate") : false}
                        onCheckedChange={(checked) => toggleSelectAll(Boolean(checked))}
                      />
                    </TableHead>
                    <TableHead className="w-16">Image</TableHead>
                    <TableHead className="max-w-xs">Name</TableHead>
                    <TableHead className="max-w-xs">Category</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product: any) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <Checkbox
                          aria-label={`Select ${product.name}`}
                          checked={selectedIds.includes(product.id)}
                          onCheckedChange={(checked) => toggleSelect(product.id, Boolean(checked))}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="relative w-12 h-12 rounded overflow-hidden bg-muted">
                          <Image
                            src={product.thumbnail_url || product.image_url || "/placeholder.svg?height=48&width=48"}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="cursor-help">
                                <p className="font-medium truncate max-w-xs">{product.name}</p>
                                <p className="text-xs text-muted-foreground truncate max-w-xs">{product.slug}</p>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <div className="space-y-1">
                                <p className="font-semibold">{product.name}</p>
                                <p className="text-xs">{product.slug}</p>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <p className="truncate max-w-xs cursor-help">{product.category_name}</p>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{product.category_name}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell className="text-right">
                        <div>
                          <p className="font-medium">Rs. {Number(product.current_price).toLocaleString()}</p>
                          {product.original_price > product.current_price && (
                            <p className="text-xs text-muted-foreground line-through">
                              Rs. {Number(product.original_price).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{product.stock_quantity}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {product.is_featured && <Badge variant="secondary">Featured</Badge>}
                          {product.is_new_arrival && (
                            <Badge className="bg-secondary text-secondary-foreground">New</Badge>
                          )}
                          {product.stock_quantity === 0 && <Badge variant="destructive">Out of Stock</Badge>}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/admin/products/${product.id}`}>
                              <Pencil className="w-4 h-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleteId(product.id)}
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
          </CardContent>
        </Card>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this product? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleting}
            >
              {deleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={bulkOpen}
        onOpenChange={(open) => {
          setBulkOpen(open)
          if (!open) {
            resetBulkForm()
            setBulkSaving(false)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Edit Products</DialogTitle>
            <DialogDescription>
              Apply changes to the selected products. Leave a field as "No change" to keep existing values.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <p className="text-sm font-medium">Featured</p>
              <Select value={featureStatus} onValueChange={(value) => setFeatureStatus(value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose featured status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-change">No change</SelectItem>
                  <SelectItem value="true">Set as featured</SelectItem>
                  <SelectItem value="false">Remove featured</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">New Arrival</p>
              <Select value={newArrivalStatus} onValueChange={(value) => setNewArrivalStatus(value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose new arrival status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-change">No change</SelectItem>
                  <SelectItem value="true">Set as new arrival</SelectItem>
                  <SelectItem value="false">Remove new arrival</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Category</p>
              <Select value={bulkCategoryId} onValueChange={setBulkCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="No change" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-change">No change</SelectItem>
                  {categories.map((category: any) => (
                    <SelectItem key={category.id} value={String(category.id)}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Brand</p>
              <Select value={bulkBrandId} onValueChange={setBulkBrandId}>
                <SelectTrigger>
                  <SelectValue placeholder="No change" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-change">No change</SelectItem>
                  {brands.map((brand: any) => (
                    <SelectItem key={brand.id} value={String(brand.id)}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                resetBulkForm()
                setBulkOpen(false)
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleBulkSave} disabled={bulkSaving}>
              {bulkSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Apply Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
