"use client"

import Link from "next/link"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Users, Package, ShoppingCart, DollarSign, Eye, TrendingUp, ArrowUp, ArrowDown } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-purple-100 text-purple-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
}

export default function AdminDashboard() {
  const { data, isLoading } = useSWR("/api/analytics", fetcher)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const overview = data?.overview || {}
  const recentOrders = data?.recentOrders || []
  const mostViewedProducts = data?.mostViewedProducts || []
  const dailyRevenue = data?.dailyRevenue || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to your admin dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-200">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-blue-600 font-medium">Revenue</p>
                <p className="text-lg font-bold text-blue-900">Rs. {overview.totalRevenue?.toLocaleString() || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-200">
                <ShoppingCart className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-purple-600 font-medium">Orders</p>
                <p className="text-lg font-bold text-purple-900">{overview.totalOrders || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-green-200">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-green-600 font-medium">Customers</p>
                <p className="text-lg font-bold text-green-900">{overview.totalUsers || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-orange-200">
                <Package className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-orange-600 font-medium">Products</p>
                <p className="text-lg font-bold text-orange-900">{overview.totalProducts || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-pink-50 to-pink-100/50 border-pink-200 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-pink-200">
                <Eye className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <p className="text-xs text-pink-600 font-medium">Views Today</p>
                <p className="text-lg font-bold text-pink-900">{overview.viewsToday || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card className="bg-white border-gray-100 rounded-3xl shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg text-gray-900">Recent Orders</CardTitle>
            <Link href="/admin/orders" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <p className="text-sm text-gray-600 text-center py-8">No orders yet</p>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order: any) => (
                  <Link
                    key={order.id}
                    href={`/admin/orders/${order.id}`}
                    className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 hover:bg-gray-100 transition border border-gray-100"
                  >
                    <div>
                      <p className="font-medium text-sm">{order.order_number}</p>
                      <p className="text-xs text-muted-foreground">{order.customer_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm text-primary">
                        Rs. {Number(order.total_amount).toLocaleString()}
                      </p>
                      <Badge className={`${statusColors[order.status]} text-xs`}>{order.status}</Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Most Viewed Products */}
        <Card className="bg-white border-gray-100 rounded-3xl shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg text-gray-900">Most Viewed Products</CardTitle>
            <Link href="/admin/analytics" className="text-sm text-primary hover:underline">
              View analytics
            </Link>
          </CardHeader>
          <CardContent>
            {mostViewedProducts.length === 0 ? (
              <p className="text-sm text-gray-600 text-center py-8">No data yet</p>
            ) : (
              <div className="space-y-3">
                {mostViewedProducts.slice(0, 5).map((product: any, index: number) => (
                  <div key={product.id} className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-gray-400 w-6">#{index + 1}</span>
                      <div>
                        <p className="font-medium text-sm line-clamp-1">{product.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Eye className="w-4 h-4" />
                      {product.view_count}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Daily Revenue Chart (Simple) */}
        <Card className="lg:col-span-2 bg-white border-gray-100 rounded-3xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-gray-900">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Revenue Trend (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dailyRevenue.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No revenue data yet</p>
            ) : (
              <div className="space-y-6">
                <div className="flex items-end gap-1 h-56 pb-2">
                  {dailyRevenue.map((day: any) => {
                    const maxRevenue = Math.max(...dailyRevenue.map((d: any) => Number(d.revenue)))
                    const height = maxRevenue > 0 ? (Number(day.revenue) / maxRevenue) * 100 : 0
                    return (
                      <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-full bg-gradient-to-t from-blue-400 to-blue-500 rounded-t-lg hover:from-blue-500 hover:to-blue-600 transition-all group relative shadow-sm" 
                             style={{ height: `${Math.max(height, 5)}%` }}>
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                            Rs. {Number(day.revenue).toLocaleString()}
                          </div>
                        </div>
                        <div className="text-center mt-2">
                          <p className="text-xs font-medium text-gray-900">{new Date(day.date).toLocaleDateString("en-US", { weekday: "short" })}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                  <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <p className="text-xs text-blue-600 font-medium">Today</p>
                    <p className="text-sm font-bold text-blue-900">Rs. {Number(dailyRevenue[dailyRevenue.length - 1]?.revenue || 0).toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-xl border border-green-100">
                    <p className="text-xs text-green-600 font-medium">Daily Avg</p>
                    <p className="text-sm font-bold text-green-900">Rs. {(dailyRevenue.reduce((a: number, b: any) => a + Number(b.revenue), 0) / dailyRevenue.length).toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                    <p className="text-xs text-purple-600 font-medium">Week Total</p>
                    <p className="text-sm font-bold text-purple-900">Rs. {dailyRevenue.reduce((a: number, b: any) => a + Number(b.revenue), 0).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
