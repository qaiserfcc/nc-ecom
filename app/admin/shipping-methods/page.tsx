"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Plus, Edit, Trash2, Package } from "lucide-react"
import { notify } from "@/lib/utils/notifications"
import { useAuth } from "@/lib/hooks/use-auth"

interface ShippingMethod {
  id: number
  name: string
  description: string
  base_cost: number
  min_order_amount: number | null
  max_order_amount: number | null
  is_free_shipping: boolean
  location_type: string
  is_same_day: boolean
  is_active: boolean
  sort_order: number
}

export default function ShippingMethodsPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    base_cost: "0",
    min_order_amount: "",
    max_order_amount: "",
    is_free_shipping: false,
    location_type: "all",
    is_same_day: false,
    is_active: true,
    sort_order: "0"
  })

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/admin')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    fetchShippingMethods()
  }, [])

  const fetchShippingMethods = async () => {
    try {
      const res = await fetch('/api/shipping-methods')
      const data = await res.json()
      setShippingMethods(data.shippingMethods || [])
    } catch (error) {
      notify.error("Failed to load shipping methods")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const payload = {
      name: formData.name,
      description: formData.description,
      base_cost: parseFloat(formData.base_cost) || 0,
      min_order_amount: formData.min_order_amount ? parseFloat(formData.min_order_amount) : null,
      max_order_amount: formData.max_order_amount ? parseFloat(formData.max_order_amount) : null,
      is_free_shipping: formData.is_free_shipping,
      location_type: formData.location_type,
      is_same_day: formData.is_same_day,
      is_active: formData.is_active,
      sort_order: parseInt(formData.sort_order) || 0
    }

    try {
      const url = editingId 
        ? `/api/shipping-methods/${editingId}`
        : '/api/shipping-methods'
      
      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to save shipping method')
      }

      notify.success(editingId ? "Shipping method updated" : "Shipping method created")
      resetForm()
      fetchShippingMethods()
    } catch (error: any) {
      notify.error(error.message)
    }
  }

  const handleEdit = (method: ShippingMethod) => {
    setEditingId(method.id)
    setFormData({
      name: method.name,
      description: method.description || "",
      base_cost: method.base_cost.toString(),
      min_order_amount: method.min_order_amount?.toString() || "",
      max_order_amount: method.max_order_amount?.toString() || "",
      is_free_shipping: method.is_free_shipping,
      location_type: method.location_type || "all",
      is_same_day: method.is_same_day,
      is_active: method.is_active,
      sort_order: method.sort_order.toString()
    })
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this shipping method?')) {
      return
    }

    try {
      const res = await fetch(`/api/shipping-methods/${id}`, {
        method: 'DELETE'
      })

      if (!res.ok) {
        throw new Error('Failed to delete shipping method')
      }

      notify.success("Shipping method deleted")
      fetchShippingMethods()
    } catch (error: any) {
      notify.error(error.message)
    }
  }

  const resetForm = () => {
    setEditingId(null)
    setFormData({
      name: "",
      description: "",
      base_cost: "0",
      min_order_amount: "",
      max_order_amount: "",
      is_free_shipping: false,
      location_type: "all",
      is_same_day: false,
      is_active: true,
      sort_order: "0"
    })
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Shipping Methods Management</h1>
        <p className="text-muted-foreground">Configure shipping options for your customers</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Form Section */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {editingId ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                {editingId ? "Edit Shipping Method" : "Add Shipping Method"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="base_cost">Base Cost (Rs)</Label>
                  <Input
                    id="base_cost"
                    type="number"
                    step="0.01"
                    value={formData.base_cost}
                    onChange={(e) => setFormData({ ...formData, base_cost: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="min_order">Min Order Amount (Rs)</Label>
                  <Input
                    id="min_order"
                    type="number"
                    step="0.01"
                    value={formData.min_order_amount}
                    onChange={(e) => setFormData({ ...formData, min_order_amount: e.target.value })}
                    placeholder="Leave empty for no minimum"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location_type">Location</Label>
                  <Select 
                    value={formData.location_type} 
                    onValueChange={(value) => setFormData({ ...formData, location_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      <SelectItem value="lahore">Lahore Only</SelectItem>
                      <SelectItem value="out_of_lahore">Outside Lahore</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="is_free">Free Shipping</Label>
                  <Switch
                    id="is_free"
                    checked={formData.is_free_shipping}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_free_shipping: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="is_same_day">Same Day Delivery</Label>
                  <Switch
                    id="is_same_day"
                    checked={formData.is_same_day}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_same_day: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="is_active">Active</Label>
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sort_order">Sort Order</Label>
                  <Input
                    id="sort_order"
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: e.target.value })}
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    {editingId ? "Update" : "Create"}
                  </Button>
                  {editingId && (
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* List Section */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Shipping Methods ({shippingMethods.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {shippingMethods.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No shipping methods configured</p>
                ) : (
                  shippingMethods.map((method) => (
                    <div
                      key={method.id}
                      className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{method.name}</h3>
                          {!method.is_active && (
                            <span className="text-xs px-2 py-0.5 bg-muted rounded">Inactive</span>
                          )}
                          {method.is_same_day && (
                            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">Same Day</span>
                          )}
                          {method.is_free_shipping && (
                            <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded">Free</span>
                          )}
                        </div>
                        {method.description && (
                          <p className="text-sm text-muted-foreground mb-2">{method.description}</p>
                        )}
                        <div className="text-sm space-y-1">
                          <p>Cost: <span className="font-medium">Rs {Number(method.base_cost).toLocaleString()}</span></p>
                          {method.min_order_amount && (
                            <p>Min Order: <span className="font-medium">Rs {Number(method.min_order_amount).toLocaleString()}</span></p>
                          )}
                          <p>Location: <span className="font-medium capitalize">{method.location_type.replace('_', ' ')}</span></p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(method)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(method.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
