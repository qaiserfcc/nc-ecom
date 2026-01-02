"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Loader2, Plus, Edit, Trash2, Eye } from "lucide-react"
import { useRouter } from "next/navigation"

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
  const [brands, setBrands] = useState<Brand[]>([])
  const [filteredBrands, setFilteredBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [deleting, setDeleting] = useState<number | null>(null)

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
  }, [searchTerm, brands])

  const fetchBrands = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/brands?all=true")
      if (!response.ok) throw new Error("Failed to fetch brands")
      const data = await response.json()
      setBrands(data.brands || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load brands")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this brand?")) return

    try {
      setDeleting(id)
      const response = await fetch(`/api/brands/${id}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Failed to delete brand")
      setBrands(brands.filter((b) => b.id !== id))
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete brand")
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
          <h1 className="text-3xl font-bold text-foreground">Brands</h1>
          <p className="text-muted-foreground mt-1">Manage brand partners</p>
        </div>
        <Link href="/admin/brands/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Brand
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Brand List</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Input
            placeholder="Search brands by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />

          {error && (
            <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
              {error}
            </div>
          )}

          {filteredBrands.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No brands found</p>
              {brands.length === 0 && (
                <Link href="/admin/brands/new">
                  <Button variant="outline">Create First Brand</Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
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
                  {filteredBrands.map((brand) => (
                    <TableRow key={brand.id}>
                      <TableCell>
                        <div className="w-10 h-10 rounded border bg-muted flex items-center justify-center">
                          {brand.logo_url ? (
                            <img
                              src={brand.logo_url}
                              alt={brand.name}
                              className="w-full h-full object-cover rounded"
                            />
                          ) : (
                            <span className="text-xs text-muted-foreground">No logo</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{brand.name}</TableCell>
                      <TableCell>
                        {brand.is_featured && (
                          <Badge variant="default">Featured</Badge>
                        )}
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
          )}

          <div className="text-sm text-muted-foreground">
            Total: {filteredBrands.length} brand{filteredBrands.length !== 1 ? "s" : ""}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
