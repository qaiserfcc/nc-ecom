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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Pencil, Trash2, Loader2, ChevronLeft, ChevronRight, FolderTree } from "lucide-react"
import { notify } from "@/lib/utils/notifications"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function AdminCategoriesPage() {
  const [search, setSearch] = useState("")
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [editOpen, setEditOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const itemsPerPage = 12

  const { data, isLoading, mutate } = useSWR(
    `/api/categories?search=${search}&limit=${itemsPerPage}&offset=${(currentPage - 1) * itemsPerPage}`,
    fetcher
  )

  const categories = data?.categories || []
  const total = data?.pagination?.total || 0
  const totalPages = Math.ceil(total / itemsPerPage)

  // Get only parent categories for the dropdown
  const parentCategories = categories.filter((cat: any) => !cat.parent_category_id)

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/categories/${deleteId}`, { method: "DELETE" })
      if (!res.ok) {
        const error = await res.json()
        notify.error(error.error || "Failed to delete category")
        return
      }
      notify.success("Category deleted successfully")
      await mutate()
    } catch (error) {
      notify.error("Failed to delete category")
      console.error("Delete error:", error)
    } finally {
      setDeleting(false)
      setDeleteId(null)
    }
  }

  const handleEdit = (category: any) => {
    setEditingCategory(category)
    setEditOpen(true)
  }

  const handleCreateNew = () => {
    setEditingCategory({
      id: null,
      name: "",
      slug: "",
      description: "",
      image_url: "",
      parent_category_id: null,
    })
    setEditOpen(true)
  }

  const handleSave = async () => {
    if (!editingCategory?.name || !editingCategory?.slug) {
      notify.error("Name and slug are required")
      return
    }

    setSaving(true)
    try {
      const method = editingCategory.id ? "PUT" : "POST"
      const url = editingCategory.id ? `/api/categories/${editingCategory.id}` : "/api/categories"

      // Normalize parent_category_id: treat null, undefined, 0, and empty string as null
      const normalizedParentId = editingCategory.parent_category_id && editingCategory.parent_category_id !== 0 
        ? editingCategory.parent_category_id 
        : null

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editingCategory.name,
          slug: editingCategory.slug,
          description: editingCategory.description,
          image_url: editingCategory.image_url,
          parent_category_id: normalizedParentId,
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to save category")
      }

      notify.success(`Category ${editingCategory.id ? "updated" : "created"} successfully`)
      setEditOpen(false)
      setEditingCategory(null)
      await mutate()
    } catch (error) {
      notify.error(error instanceof Error ? error.message : "Failed to save category")
    } finally {
      setSaving(false)
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Categories</h1>
          <p className="text-muted-foreground">Manage product categories and subcategories</p>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search categories..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setCurrentPage(1)
          }}
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : categories.length === 0 ? (
        <Card>
          <CardContent className="py-20 text-center">
            <p className="text-muted-foreground mb-4">No categories found</p>
            <Button onClick={handleCreateNew}>Add Your First Category</Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="w-full overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Products</TableHead>
                    <TableHead className="text-right">Subcategories</TableHead>
                    <TableHead className="text-right w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category: any) => (
                    <TableRow key={category.id}>
                      <TableCell>
                        <div className="relative w-12 h-12 rounded overflow-hidden bg-muted">
                          {category.image_url ? (
                            <Image
                              src={category.image_url}
                              alt={category.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FolderTree className="w-6 h-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{category.name}</p>
                        {category.parent_category_name && (
                          <p className="text-xs text-muted-foreground">
                            Parent: {category.parent_category_name}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">{category.slug}</code>
                      </TableCell>
                      <TableCell>
                        {category.parent_category_id ? (
                          <Badge variant="secondary">Subcategory</Badge>
                        ) : (
                          <Badge>Main Category</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">{category.product_count || 0}</TableCell>
                      <TableCell className="text-right">{category.subcategory_count || 0}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(category)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleteId(category.id)}
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
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this category? This action cannot be undone.
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

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingCategory?.id ? "Edit Category" : "Create Category"}</DialogTitle>
            <DialogDescription>
              {editingCategory?.id
                ? "Update the category details below"
                : "Fill in the details to create a new category"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={editingCategory?.name || ""}
                onChange={(e) => {
                  setEditingCategory({
                    ...editingCategory,
                    name: e.target.value,
                    slug: !editingCategory?.id ? generateSlug(e.target.value) : editingCategory.slug,
                  })
                }}
                placeholder="Enter category name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={editingCategory?.slug || ""}
                onChange={(e) =>
                  setEditingCategory({
                    ...editingCategory,
                    slug: e.target.value,
                  })
                }
                placeholder="category-slug"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="parent">Parent Category (for subcategories)</Label>
              <Select
                value={
                  editingCategory?.parent_category_id && editingCategory.parent_category_id !== 0
                    ? editingCategory.parent_category_id.toString()
                    : "none"
                }
                onValueChange={(value) =>
                  setEditingCategory({
                    ...editingCategory,
                    parent_category_id: value === "none" || value === "0" ? null : Number.parseInt(value),
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select parent category (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (Main Category)</SelectItem>
                  {parentCategories
                    .filter((cat: any) => cat.id !== editingCategory?.id)
                    .map((category: any) => (
                      <SelectItem key={category.id} value={String(category.id)}>
                        {category.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editingCategory?.description || ""}
                onChange={(e) =>
                  setEditingCategory({
                    ...editingCategory,
                    description: e.target.value,
                  })
                }
                placeholder="Enter category description"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image_url">Image URL</Label>
              <Input
                id="image_url"
                value={editingCategory?.image_url || ""}
                onChange={(e) =>
                  setEditingCategory({
                    ...editingCategory,
                    image_url: e.target.value,
                  })
                }
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingCategory?.id ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
