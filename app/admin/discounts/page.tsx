"use client"

import { useState } from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
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
import { Plus, Pencil, Trash2, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { notify } from "@/lib/utils/notifications"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function AdminDiscountsPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const { data, isLoading, mutate } = useSWR(
    `/api/discounts?limit=${itemsPerPage}&offset=${(currentPage - 1) * itemsPerPage}`,
    fetcher
  )
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  const [code, setCode] = useState("")
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [discountType, setDiscountType] = useState("percentage")
  const [discountValue, setDiscountValue] = useState("")
  const [minPurchase, setMinPurchase] = useState("")
  const [maxDiscount, setMaxDiscount] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [applyToAll, setApplyToAll] = useState(true)

  const discounts = data?.discounts || []
  const total = data?.pagination?.total || 0
  const totalPages = Math.ceil(total / itemsPerPage)

  const resetForm = () => {
    setCode("")
    setName("")
    setDescription("")
    setDiscountType("percentage")
    setDiscountValue("")
    setMinPurchase("")
    setMaxDiscount("")
    setStartDate("")
    setEndDate("")
    setIsActive(true)
    setApplyToAll(true)
    setEditingId(null)
  }

  const openEdit = (discount: any) => {
    setEditingId(discount.id)
    setCode(discount.code || "")
    setName(discount.name || "")
    setDescription(discount.description || "")
    setDiscountType(discount.discount_type || "percentage")
    setDiscountValue(discount.discount_value?.toString() || "")
    setMinPurchase(discount.min_purchase_amount?.toString() || "")
    setMaxDiscount(discount.max_discount_amount?.toString() || "")
    setStartDate(discount.start_date?.split("T")[0] || "")
    setEndDate(discount.end_date?.split("T")[0] || "")
    setIsActive(discount.is_active)
    setApplyToAll(discount.apply_to_all)
    setDialogOpen(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = {
        code: code || null,
        name,
        description,
        discount_type: discountType,
        discount_value: Number.parseFloat(discountValue),
        min_purchase_amount: minPurchase ? Number.parseFloat(minPurchase) : 0,
        max_discount_amount: maxDiscount ? Number.parseFloat(maxDiscount) : null,
        start_date: startDate,
        end_date: endDate,
        is_active: isActive,
        apply_to_all: applyToAll,
      }

      const url = editingId ? `/api/discounts/${editingId}` : "/api/discounts"
      const method = editingId ? "PUT" : "POST"
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const error = await res.json()
        notify.error(error.error || "Failed to save discount")
        return
      }

      notify.success(editingId ? "Discount updated successfully" : "Discount created successfully")
      await mutate()
      setDialogOpen(false)
      resetForm()
    } catch (error) {
      notify.error("Failed to save discount")
      console.error("Failed to save:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      const res = await fetch(`/api/discounts/${deleteId}`, { method: "DELETE" })
      if (!res.ok) {
        const error = await res.json()
        notify.error(error.error || "Failed to delete discount")
        return
      }
      notify.success("Discount deleted successfully")
      await mutate()
    } catch (error) {
      notify.error("Failed to delete discount")
      console.error("Failed to delete:", error)
    } finally {
      setDeleteId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Discounts</h1>
          <p className="text-muted-foreground">Manage promotions and discounts</p>
        </div>
        <Dialog
          open={dialogOpen}
          onOpenChange={(o) => {
            setDialogOpen(o)
            if (!o) resetForm()
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Discount
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Discount" : "New Discount"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Code (optional)</Label>
                  <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="SUMMER20" />
                </div>
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Summer Sale" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={discountType} onValueChange={setDiscountType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="fixed">Fixed Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Value *</Label>
                  <Input type="number" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Min Purchase</Label>
                  <Input type="number" value={minPurchase} onChange={(e) => setMinPurchase(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Max Discount</Label>
                  <Input type="number" value={maxDiscount} onChange={(e) => setMaxDiscount(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date *</Label>
                  <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>End Date *</Label>
                  <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label>Active</Label>
                <Switch checked={isActive} onCheckedChange={setIsActive} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Apply to all products</Label>
                <Switch checked={applyToAll} onCheckedChange={setApplyToAll} />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setDialogOpen(false)
                  resetForm()
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving || !name || !discountValue || !startDate || !endDate}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : discounts.length === 0 ? (
        <Card>
          <CardContent className="py-20 text-center">
            <p className="text-muted-foreground mb-4">No discounts yet</p>
            <Button onClick={() => setDialogOpen(true)}>Create Your First Discount</Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {discounts.map((discount: any) => {
                    const now = new Date()
                    const start = new Date(discount.start_date)
                    const end = new Date(discount.end_date)
                    const isExpired = end < now
                    const isUpcoming = start > now
                    return (
                      <TableRow key={discount.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{discount.name}</p>
                            {discount.description && (
                              <p className="text-xs text-muted-foreground">{discount.description}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{discount.code || "-"}</TableCell>
                        <TableCell className="capitalize">{discount.discount_type}</TableCell>
                        <TableCell>
                          {discount.discount_type === "percentage"
                            ? `${discount.discount_value}%`
                            : `Rs. ${Number(discount.discount_value).toLocaleString()}`}
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(discount.start_date).toLocaleDateString()} -{" "}
                          {new Date(discount.end_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {isExpired ? (
                            <Badge variant="secondary">Expired</Badge>
                          ) : isUpcoming ? (
                            <Badge variant="outline">Upcoming</Badge>
                          ) : discount.is_active ? (
                            <Badge className="bg-green-100 text-green-800">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEdit(discount)}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => setDeleteId(discount.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
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
            <AlertDialogTitle>Delete Discount</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this discount? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
