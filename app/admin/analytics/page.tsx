"use client"

import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, Eye, TrendingUp, Users, ShoppingCart, DollarSign } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function AdminAnalyticsPage() {
  const { data, isLoading } = useSWR("/api/analytics", fetcher)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const overview = data?.overview || {}
  const mostViewedProducts = data?.mostViewedProducts || []
  const ordersByStatus = data?.ordersByStatus || []
  const dailyRevenue = data?.dailyRevenue || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Website performance and insights</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Revenue</p>
                <p className="text-lg font-bold">Rs. {overview.totalRevenue?.toLocaleString() || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary/10">
                <ShoppingCart className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Orders</p>
                <p className="text-lg font-bold">{overview.totalOrders || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Customers</p>
                <p className="text-lg font-bold">{overview.totalUsers || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <Eye className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Views Today</p>
                <p className="text-lg font-bold">{overview.viewsToday || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100">
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Products</p>
                <p className="text-lg font-bold">{overview.totalProducts || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Revenue (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {dailyRevenue.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
            ) : (
              <div className="flex items-end gap-2 h-48">
                {dailyRevenue.map((day: any) => {
                  const maxRevenue = Math.max(...dailyRevenue.map((d: any) => Number(d.revenue)))
                  const height = maxRevenue > 0 ? (Number(day.revenue) / maxRevenue) * 100 : 0
                  return (
                    <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                      <div
                        className="w-full bg-primary/20 rounded-t relative"
                        style={{ height: `${Math.max(height, 5)}%` }}
                      >
                        <div className="absolute inset-0 bg-primary rounded-t" />
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-medium">Rs. {Number(day.revenue).toLocaleString()}</p>
                        <p className="text-[10px] text-muted-foreground">{day.orders} orders</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(day.date).toLocaleDateString("en-US", { weekday: "short" })}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Orders by Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Orders by Status</CardTitle>
          </CardHeader>
          <CardContent>
            {ordersByStatus.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No orders yet</p>
            ) : (
              <div className="space-y-4">
                {ordersByStatus.map((item: any) => {
                  const total = ordersByStatus.reduce((acc: number, i: any) => acc + Number(i.count), 0)
                  const percentage = total > 0 ? (Number(item.count) / total) * 100 : 0
                  return (
                    <div key={item.status} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="capitalize">{item.status}</span>
                        <span className="font-medium">{item.count}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${percentage}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Most Viewed Products */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Most Viewed Products (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {mostViewedProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Views</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mostViewedProducts.map((product: any, index: number) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <Badge variant="outline">{index + 1}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell className="text-right">{product.view_count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
