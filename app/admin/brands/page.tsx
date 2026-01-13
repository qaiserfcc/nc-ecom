"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Loader2, Plus, Edit, Trash2, Eye, ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { notify } from "@/lib/utils/notifications"
import { useConfirm } from "@/components/ui/confirm-dialog"

interface Brand {
  id: number
  name: string
  slug: string
  logo_url: string
  is_active: boolean
  is_featured: boolean
}

export default function BrandsPage() {
  const router = useRouter()
  const confirmDialog = useConfirm()
  const [brands, setBrands] = useState<Brand[]>([])
  const [filteredBrands, setFilteredBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [deleting, setDeleting] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12

  useEffect(() => {
    fetchBrands()
  }, [])

  useEffect(() => {
    const filtered = brands.filter(
      (brand) =>
        brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        brand.id.toString().includes(searchTerm)
    )
    setFilteredBrands(filtered)
    setCurrentPage(1) // Reset to first page when search changes
  }, [searchTerm, brands])

  // Pagination calculations
  const totalPages = Math.ceil(filteredBrands.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentBrands = filteredBrands.slice(startIndex, endIndex)

  const fetchBrands = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/brands?limit=1000")
      if (!response.ok) throw new Error("Failed to fetch brands")
      const data = await response.json()
      setBrands(data.brands || [])
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load brands"
      setError(message)
      notify.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    const ok = await confirmDialog({
      title: "Delete brand",
      description: "This will permanently delete the brand.",
      confirmText: "Delete",
      variant: "destructive",
    })

    if (!ok) return

    try {
      setDeleting(id)
      const loadingToastId = notify.loading("Waiting for delete confirmation...")
      const response = await fetch(`/api/brands/${id}`, { method: "DELETE" })
      notify.dismiss(loadingToastId)
      
      if (!response.ok) throw new Error("Failed to delete brand")
      notify.success("Brand deleted successfully")
      setBrands(brands.filter((b) => b.id !== id))
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete brand"
      notify.error(message)
    } finally {
      setDeleting(null)
    }
  }

  const toggleFeatured = async (id: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/brands/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_featured: !currentStatus }),
      })
      if (!response.ok) throw new Error("Failed to update brand")
      notify.success("Brand updated successfully")
      setBrands(brands.map((b) => (b.id === id ? { ...b, is_featured: !currentStatus } : b)))
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to toggle featured status"
      notify.error(message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Brands</h1>
          <p className="text-muted-foreground">Manage brand partners</p>
        </div>
        <Link href="/admin/brands/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Brand
          </Button>
        </Link>
      </div>

      <div className="relative max-w-md">
        <Eye className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search brands..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
          {error}
        </div>
      )}

      {filteredBrands.length === 0 ? (
        <Card>
          <CardContent className="py-20 text-center">
            <p className="text-muted-foreground mb-4">No brands found</p>
            {brands.length === 0 && (
              <Link href="/admin/brands/new">
                <Button>Add Your First Brand</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="w-full overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Logo</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Featured</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentBrands.map((brand) => (
                    <TableRow key={brand.id}>
                      <TableCell>
                        <div className="w-10 h-10 rounded border bg-muted flex items-center justify-center relative">
                          {brand.logo_url ? (
                            <Image
                              src={brand.logo_url}
                              alt={brand.name}
                              fill
                              className="object-cover rounded"
                              sizes="40px"
                            />
                          ) : (
                            <span className="text-xs text-muted-foreground">No logo</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{brand.name}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant={brand.is_featured ? "default" : "outline"}
                          onClick={() => toggleFeatured(brand.id, brand.is_featured)}
                          disabled={deleting === brand.id}
                          className="text-xs"
                        >
                          {brand.is_featured ? "Featured" : "Mark Featured"}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Badge variant={brand.is_active ? "default" : "secondary"}>
                          {brand.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Link href={`/brand/${brand.id}`}>
                            <Button size="sm" variant="ghost">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Link href={`/admin/brands/${brand.id}`}>
                            <Button size="sm" variant="ghost">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(brand.id)}
                            disabled={deleting === brand.id}
                          >
                            {deleting === brand.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
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
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredBrands.length)} of {filteredBrands.length}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>
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
        </div>
      )}
    </div>
  )
}
