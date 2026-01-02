"use client"

import { useState } from "react"
import Link from "next/link"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Edit, Trash2, Plus, Loader2, AlertCircle } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function AdminBannersPage() {
  const { data, isLoading, mutate } = useSWR("/api/banners", fetcher)
  const [deleteError, setDeleteError] = useState("")

  const banners = data?.banners || []

  const handleDelete = async (bannerId: number) => {
    if (!confirm("Are you sure you want to delete this banner?")) return

    try {
      setDeleteError("")
      const response = await fetch(`/api/banners/${bannerId}`, { method: "DELETE" })
      if (!response.ok) {
        const errorData = await response.json()
        setDeleteError(errorData.error || "Failed to delete banner")
        return
      }
      mutate()
    } catch (error) {
      console.error("Delete failed:", error)
      setDeleteError("Error deleting banner")
    }
  }

  const toggleActive = async (banner: any) => {
    try {
      const response = await fetch(`/api/banners/${banner.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: banner.title,
          description: banner.description,
          image_url: banner.image_url,
          link_url: banner.link_url,
          is_active: !banner.is_active,
          sort_order: banner.sort_order,
        }),
      })

      if (!response.ok) {
        setDeleteError("Failed to toggle banner")
        return
      }
      mutate()
    } catch (error) {
      console.error("Toggle failed:", error)
      setDeleteError("Error toggling banner")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Homepage Banners</h1>
          <p className="text-muted-foreground">Manage homepage banner settings</p>
        </div>
        <Link href="/admin/banners/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add Banner
          </Button>
        </Link>
      </div>

      {deleteError && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>{deleteError}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : banners.length === 0 ? (
        <Card>
          <CardContent className="py-20 text-center">
            <p className="text-muted-foreground">No banners created yet. Create one to get started!</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Preview</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Order</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {banners.map((banner: any) => (
                    <TableRow key={banner.id}>
                      <TableCell>
                        <div className="w-16 h-10 rounded border overflow-hidden bg-muted">
                          <img
                            src={banner.image_url}
                            alt={banner.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/placeholder.svg"
                            }}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{banner.title}</p>
                          {banner.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1">{banner.description}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={banner.is_active ? "default" : "secondary"}>
                          {banner.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{banner.sort_order}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(banner.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleActive(banner)}
                            className="gap-1"
                          >
                            {banner.is_active ? "Deactivate" : "Activate"}
                          </Button>
                          <Link href={`/admin/banners/${banner.id}`}>
                            <Button variant="ghost" size="sm" className="gap-1">
                              <Edit className="w-4 h-4" />
                              Edit
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDelete(banner.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
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
    </div>
  )
}
