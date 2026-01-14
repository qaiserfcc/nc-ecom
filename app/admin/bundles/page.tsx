"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
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
import { Plus, Search, Pencil, Trash2, Loader2, Eye, ChevronLeft, ChevronRight } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { notify } from "@/lib/utils/notifications"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function AdminBundlesPage() {
  const [search, setSearch] = useState("")
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [bulkOpen, setBulkOpen] = useState(false)
  const [bulkSaving, setBulkSaving] = useState(false)
  const [statusChange, setStatusChange] = useState<"no-change" | "true" | "false">("no-change")
  const itemsPerPage = 12

  const bundlesUrl = (() => {
    const params = new URLSearchParams()
    params.set("search", search)
    params.set("limit", String(itemsPerPage))
    params.set("offset", String((currentPage - 1) * itemsPerPage))
    return `/api/bundles?${params.toString()}`
  })()

  const { data, isLoading, mutate } = useSWR(bundlesUrl, fetcher)

  const bundles = data?.bundles || []
  const total = data?.pagination?.total || 0
  const totalPages = Math.ceil(total / itemsPerPage)
  
  const allSelected = bundles.length > 0 && selectedIds.length === bundles.length

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(bundles.map((b: any) => b.id))
    } else {
      setSelectedIds([])
    }
  }

  const toggleSelect = (id: number, checked: boolean) => {
    setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((pid) => pid !== id)))
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/bundles/${deleteId}`, { method: "DELETE" })
      if (!res.ok) {
        const error = await res.json()
        notify.error(error.error || "Failed to delete bundle")
        return
      }
      notify.success("Bundle deleted successfully")
      await mutate()
    } catch (error) {
      notify.error("Failed to delete bundle")
      console.error("Delete error:", error)
    } finally {
      setDeleting(false)
      setDeleteId(null)
    }
  }

  const handleBulkSave = async () => {
    if (selectedIds.length === 0) {
      notify.warning("Select bundles", "Choose bundles to bulk edit")
      return
    }

    const payload: any = { ids: selectedIds }
    if (statusChange !== "no-change") payload.is_active = statusChange === "true"
    
    if (Object.keys(payload).length === 1) {
      notify.warning("No changes selected", "Choose at least one field to update")
      return
    }

    setBulkSaving(true)
    try {
      const res = await fetch("/api/bundles/bulk", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to update bundles")
      }

      notify.success("Bundles updated", "Bulk changes applied")
      setBulkOpen(false)
      setStatusChange("no-change")
      setSelectedIds([])
      await mutate()
    } catch (error) {
      notify.error("Bulk update failed", error instanceof Error ? error.message : "Please try again")
    } finally {
      setBulkSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Bundles</h1>
          <p className="text-muted-foreground">Manage your product bundles</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            disabled={selectedIds.length === 0}
            onClick={() => {
              setStatusChange("no-change")
              setBulkOpen(true)
            }}
          >
            Bulk Edit{selectedIds.length > 0 ? ` (${selectedIds.length})` : ""}
          </Button>
          <Button asChild>
            <Link href="/admin/bundles/new">
              <Plus className="w-4 h-4 mr-2" />
              Add Bundle
            </Link>
          </Button>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search bundles..."
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
      ) : bundles.length === 0 ? (
        <Card>
          <CardContent className="py-20 text-center">
            <p className="text-muted-foreground mb-4">No bundles found</p>
            <Button asChild>
              <Link href="/admin/bundles/new">Add Your First Bundle</Link>
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
                        aria-label="Select all bundles"
                        checked={selectedIds.length > 0 ? (allSelected ? true : "indeterminate") : false}
                        onCheckedChange={(checked) => toggleSelectAll(Boolean(checked))}
                      />
                    </TableHead>
                    <TableHead className="w-16">Image</TableHead>
                    <TableHead className="max-w-xs">Name</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Items</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bundles.map((bundle: any) => (
                    <TableRow key={bundle.id}>
                      <TableCell>
                        <Checkbox
                          aria-label={`Select ${bundle.name}`}
                          checked={selectedIds.includes(bundle.id)}
                          onCheckedChange={(checked) => toggleSelect(bundle.id, Boolean(checked))}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="relative w-12 h-12 rounded overflow-hidden bg-muted">
                          <Image
                            src={bundle.image_url || "/placeholder.svg?height=48&width=48"}
                            alt={bundle.name}
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
                                <p className="font-medium truncate max-w-xs">{bundle.name}</p>
                                <p className="text-xs text-muted-foreground truncate max-w-xs">{bundle.slug}</p>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <div className="space-y-1">
                                <p className="font-semibold">{bundle.name}</p>
                                <p className="text-xs">{bundle.slug}</p>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell className="text-right">
                        <p className="font-medium">Rs. {Number(bundle.bundle_price).toLocaleString()}</p>
                      </TableCell>
                      <TableCell className="text-right">{bundle.item_count}</TableCell>
                      <TableCell>
                        <Badge variant={bundle.is_active ? "default" : "secondary"}>
                          {bundle.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/bundle/${bundle.id}`}>
                              <Eye className="w-4 h-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/admin/bundles/${bundle.id}`}>
                              <Pencil className="w-4 h-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleteId(bundle.id)}
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
            <AlertDialogTitle>Delete Bundle</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this bundle? This action cannot be undone.
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
            setStatusChange("no-change")
            setBulkSaving(false)
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Bulk Edit Bundles</DialogTitle>
            <DialogDescription className="text-base">
              Apply changes to {selectedIds.length} selected bundle{selectedIds.length !== 1 ? 's' : ''}. 
              Leave a field as "No change" to keep existing values.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="status-select" className="text-sm font-semibold">Status</Label>
              <Select value={statusChange} onValueChange={(value) => setStatusChange(value as any)}>
                <SelectTrigger id="status-select" className="h-11">
                  <SelectValue placeholder="Choose status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-change">No change</SelectItem>
                  <SelectItem value="true">✓ Set as active</SelectItem>
                  <SelectItem value="false">✗ Set as inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setStatusChange("no-change")
                setBulkOpen(false)
              }}
              disabled={bulkSaving}
            >
              Cancel
            </Button>
            <Button onClick={handleBulkSave} disabled={bulkSaving} className="min-w-[120px]">
              {bulkSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {bulkSaving ? "Saving..." : "Apply Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
