"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Loader2, Plus, Edit, Trash2, Eye, ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"

interface Bundle {
  id: number
  name: string
  slug: string
  bundle_price: number
  is_active: boolean
  item_count: number
  image_url: string
}

export default function BundlesPage() {
  const router = useRouter()
  const [bundles, setBundles] = useState<Bundle[]>([])
  const [filteredBundles, setFilteredBundles] = useState<Bundle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [deleting, setDeleting] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    fetchBundles()
  }, [])

  useEffect(() => {
    const filtered = bundles.filter(
      (bundle) =>
        bundle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bundle.id.toString().includes(searchTerm)
    )
    setFilteredBundles(filtered)
    setCurrentPage(1) // Reset to first page when search changes
  }, [searchTerm, bundles])

  // Pagination calculations
  const totalPages = Math.ceil(filteredBundles.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentBundles = filteredBundles.slice(startIndex, endIndex)

  const fetchBundles = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/bundles?all=true")
      if (!response.ok) throw new Error("Failed to fetch bundles")
      const data = await response.json()
      setBundles(data.bundles || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load bundles")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this bundle?")) return

    try {
      setDeleting(id)
      const response = await fetch(`/api/bundles/${id}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Failed to delete bundle")
      setBundles(bundles.filter((b) => b.id !== id))
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete bundle")
    } finally {
      setDeleting(null)
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Bundles</h1>
          <p className="text-muted-foreground mt-1">Manage product bundles</p>
        </div>
        <Link href="/admin/bundles/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Bundle
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bundle List</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Input
            placeholder="Search bundles by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />

          {error && (
            <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
              {error}
            </div>
          )}

          {filteredBundles.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No bundles found</p>
              {bundles.length === 0 && (
                <Link href="/admin/bundles/new">
                  <Button variant="outline">Create First Bundle</Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentBundles.map((bundle) => (
                    <TableRow key={bundle.id}>
                      <TableCell className="font-medium">{bundle.name}</TableCell>
                      <TableCell>Rs. {bundle.bundle_price.toLocaleString()}</TableCell>
                      <TableCell>{bundle.item_count}</TableCell>
                      <TableCell>
                        <Badge variant={bundle.is_active ? "default" : "secondary"}>
                          {bundle.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Link href={`/bundle/${bundle.id}`}>
                            <Button size="sm" variant="ghost">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Link href={`/admin/bundles/${bundle.id}`}>
                            <Button size="sm" variant="ghost">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(bundle.id)}
                            disabled={deleting === bundle.id}
                          >
                            {deleting === bundle.id ? (
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
          )}

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredBundles.length)} of {filteredBundles.length} bundle{filteredBundles.length !== 1 ? "s" : ""}
            </div>
            
            {totalPages > 1 && (
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
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
