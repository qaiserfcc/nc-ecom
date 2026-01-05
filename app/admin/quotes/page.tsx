"use client"

import { useState } from "react"
import * as React from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import { notify } from "@/lib/utils/notifications"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  reviewed: "bg-blue-100 text-blue-800",
  quoted: "bg-purple-100 text-purple-800",
  accepted: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  completed: "bg-emerald-100 text-emerald-800",
}

interface Quote {
  id: number
  user_id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  product_details: string
  quantity: number
  additional_notes: string
  status: string
  quoted_price: number | null
  admin_notes: string | null
  created_at: string
  updated_at: string
  user_name?: string
  user_email?: string
}

export default function AdminQuotesPage() {
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null)
  const [updatingQuote, setUpdatingQuote] = useState(false)
  const [updateForm, setUpdateForm] = useState({
    status: "",
    quoted_price: "",
    admin_notes: "",
  })
  
  const itemsPerPage = 12
  
  const { data, isLoading, mutate } = useSWR(
    `/api/quotes${statusFilter !== "all" ? `?status=${statusFilter}` : ""}`,
    fetcher,
  )

  const quotes = data?.quotes || []
  const total = quotes.length
  const totalPages = Math.ceil(total / itemsPerPage)
  const displayedQuotes = quotes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleEdit = (quote: Quote) => {
    setEditingQuote(quote)
    setUpdateForm({
      status: quote.status,
      quoted_price: quote.quoted_price?.toString() || "",
      admin_notes: quote.admin_notes || "",
    })
  }

  const handleUpdate = async () => {
    if (!editingQuote) return
    
    setUpdatingQuote(true)
    const toastId = notify.loading("Updating quote...")

    try {
      const response = await fetch(`/api/quotes/${editingQuote.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: updateForm.status,
          quoted_price: updateForm.quoted_price ? parseFloat(updateForm.quoted_price) : null,
          admin_notes: updateForm.admin_notes,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update quote")
      }

      notify.dismiss(toastId)
      notify.success("Quote updated successfully")
      setEditingQuote(null)
      mutate()
    } catch (error) {
      notify.dismiss(toastId)
      notify.error("Failed to update quote")
    } finally {
      setUpdatingQuote(false)
    }
  }

  const handleDelete = async (quoteId: number) => {
    if (!confirm("Are you sure you want to delete this quote?")) return

    const toastId = notify.loading("Deleting quote...")
    
    try {
      const response = await fetch(`/api/quotes/${quoteId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete quote")
      }

      notify.dismiss(toastId)
      notify.success("Quote deleted successfully")
      mutate()
    } catch (error) {
      notify.dismiss(toastId)
      notify.error("Failed to delete quote")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Quote Requests</h1>
          <p className="text-muted-foreground">Manage customer quote requests</p>
        </div>
        <Select value={statusFilter} onValueChange={(v) => {
          setStatusFilter(v)
          setCurrentPage(1)
        }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Quotes</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="reviewed">Reviewed</SelectItem>
            <SelectItem value="quoted">Quoted</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : displayedQuotes.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground">
              No quotes found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Product Details</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Quoted Price</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedQuotes.map((quote: Quote) => (
                    <TableRow key={quote.id}>
                      <TableCell className="font-medium">#{quote.id}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{quote.customer_name}</div>
                          <div className="text-sm text-muted-foreground">{quote.customer_email}</div>
                          {quote.customer_phone && (
                            <div className="text-sm text-muted-foreground">{quote.customer_phone}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-md">
                          <p className="line-clamp-2 text-sm">{quote.product_details}</p>
                          {quote.additional_notes && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                              Note: {quote.additional_notes}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{quote.quantity}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[quote.status] || "bg-gray-100 text-gray-800"}>
                          {quote.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {quote.quoted_price ? (
                          <span className="font-medium text-green-600">
                            Rs. {quote.quoted_price.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(quote.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(quote)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(quote.id)}
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

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, total)} of {total} quotes
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (page) =>
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                )
                .map((page, index, array) => (
                  <React.Fragment key={page}>
                    {index > 0 && array[index - 1] !== page - 1 && (
                      <span key={`ellipsis-${page}`}>...</span>
                    )}
                    <Button
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  </React.Fragment>
                ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingQuote} onOpenChange={(open) => !open && setEditingQuote(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Update Quote #{editingQuote?.id}</DialogTitle>
            <DialogDescription>
              Update the quote status, price, and admin notes
            </DialogDescription>
          </DialogHeader>
          
          {editingQuote && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Customer</Label>
                <p className="text-sm font-medium">{editingQuote.customer_name}</p>
                <p className="text-sm text-muted-foreground">{editingQuote.customer_email}</p>
              </div>

              <div className="space-y-2">
                <Label>Product Details</Label>
                <p className="text-sm">{editingQuote.product_details}</p>
                <p className="text-sm text-muted-foreground">Quantity: {editingQuote.quantity}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={updateForm.status}
                  onValueChange={(value) => setUpdateForm({ ...updateForm, status: value })}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="reviewed">Reviewed</SelectItem>
                    <SelectItem value="quoted">Quoted</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quoted_price">Quoted Price (Rs.)</Label>
                <Input
                  id="quoted_price"
                  type="number"
                  step="0.01"
                  value={updateForm.quoted_price}
                  onChange={(e) => setUpdateForm({ ...updateForm, quoted_price: e.target.value })}
                  placeholder="Enter quoted price"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin_notes">Admin Notes</Label>
                <Textarea
                  id="admin_notes"
                  value={updateForm.admin_notes}
                  onChange={(e) => setUpdateForm({ ...updateForm, admin_notes: e.target.value })}
                  placeholder="Add notes for the customer..."
                  rows={4}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingQuote(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={updatingQuote}>
              {updatingQuote ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Quote"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
