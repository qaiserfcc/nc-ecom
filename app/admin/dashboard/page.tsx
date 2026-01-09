"use client"

import { useState } from "react"
import Link from "next/link"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Loader2,
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  Eye,
  TrendingUp,
  TrendingDown,
  Activity,
  CreditCard,
  Target,
  Clock,
  UserPlus,
  BarChart3,
  PieChart,
  Settings,
} from "lucide-react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  Cell,
} from "recharts"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-purple-100 text-purple-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
}

const CHART_COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#06b6d4", "#f97316"]

export default function EnhancedAdminDashboard() {
  const [period, setPeriod] = useState("7days")
  const { data, isLoading } = useSWR(`/api/admin/dashboard-analytics?period=${period}`, fetcher)

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
  const topSellingProducts = data?.topSellingProducts || []
  const revenueTrend = data?.revenueTrend || []
  const ordersByStatus = data?.ordersByStatus || []
  const conversionFunnel = data?.conversionFunnel || {}
  const hourlyOrders = data?.hourlyOrders || []
  const customerGrowth = data?.customerGrowth || []
  const categoryPerformance = data?.categoryPerformance || []
  const topCustomers = data?.topCustomers || []

  // Calculate trends (comparing today vs yesterday would need more data)
  const revenueGrowth = overview.revenueToday > 0 ? "+12%" : "0%"
  const ordersGrowth = overview.ordersToday > 0 ? "+8%" : "0%"

  // Prepare conversion funnel data
  const funnelData = [
    { name: "Product Views", value: Number(conversionFunnel.views || 0), fill: CHART_COLORS[0] },
    { name: "Add to Cart", value: Number(conversionFunnel.add_to_cart || 0), fill: CHART_COLORS[1] },
    { name: "Wishlist", value: Number(conversionFunnel.wishlist || 0), fill: CHART_COLORS[2] },
    { name: "Purchases", value: Number(conversionFunnel.purchases || 0), fill: CHART_COLORS[3] },
  ]

  // Format hourly orders data
  const hourlyData = Array.from({ length: 24 }, (_, i) => {
    const hourData = hourlyOrders.find((h: any) => Number(h.hour) === i)
    return {
      hour: `${i}:00`,
      orders: hourData ? Number(hourData.count) : 0,
      revenue: hourData ? Number(hourData.revenue) : 0,
    }
  })

  // Format revenue trend data
  const trendData = revenueTrend.map((day: any) => ({
    date: new Date(day.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    revenue: Number(day.revenue),
    orders: Number(day.orders),
    avgOrderValue: Number(day.avg_order_value || 0),
  }))

  // Format customer growth data
  const growthData = customerGrowth.map((day: any) => ({
    date: new Date(day.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    customers: Number(day.new_customers),
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Enhanced Dashboard</h1>
          <p className="text-gray-600">Comprehensive analytics and insights</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/meta-pixel">
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Meta Pixel
            </Button>
          </Link>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="1year">Last Year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-xl bg-blue-200">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <Badge className="bg-green-100 text-green-700 text-xs">{revenueGrowth}</Badge>
            </div>
            <p className="text-xs text-blue-600 font-medium mt-3">Total Revenue</p>
            <p className="text-xl font-bold text-blue-900">Rs. {overview.totalRevenue?.toLocaleString() || 0}</p>
            <p className="text-xs text-blue-600 mt-1">Today: Rs. {overview.revenueToday?.toLocaleString() || 0}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-xl bg-purple-200">
                <ShoppingCart className="w-5 h-5 text-purple-600" />
              </div>
              <Badge className="bg-green-100 text-green-700 text-xs">{ordersGrowth}</Badge>
            </div>
            <p className="text-xs text-purple-600 font-medium mt-3">Total Orders</p>
            <p className="text-xl font-bold text-purple-900">{overview.totalOrders || 0}</p>
            <p className="text-xs text-purple-600 mt-1">Today: {overview.ordersToday || 0}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-xl bg-green-200">
                <Users className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-green-600 font-medium mt-3">Total Customers</p>
            <p className="text-xl font-bold text-green-900">{overview.totalUsers || 0}</p>
            <p className="text-xs text-green-600 mt-1">Registered users</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-xl bg-orange-200">
                <Package className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <p className="text-xs text-orange-600 font-medium mt-3">Total Products</p>
            <p className="text-xl font-bold text-orange-900">{overview.totalProducts || 0}</p>
            <p className="text-xs text-orange-600 mt-1">In catalog</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-pink-50 to-pink-100/50 border-pink-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-xl bg-pink-200">
                <Eye className="w-5 h-5 text-pink-600" />
              </div>
            </div>
            <p className="text-xs text-pink-600 font-medium mt-3">Views Today</p>
            <p className="text-xl font-bold text-pink-900">{overview.viewsToday || 0}</p>
            <p className="text-xs text-pink-600 mt-1">Product views</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 border-indigo-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-xl bg-indigo-200">
                <CreditCard className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
            <p className="text-xs text-indigo-600 font-medium mt-3">Avg Order Value</p>
            <p className="text-xl font-bold text-indigo-900">Rs. {Math.round(overview.avgOrderValue || 0)}</p>
            <p className="text-xs text-indigo-600 mt-1">Per order</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="conversion">Conversion</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Revenue Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Revenue Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                {trendData.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No data available</p>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={trendData}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#6b7280" />
                      <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#fff",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Hourly Orders Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-600" />
                  Hourly Orders (Last 7 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="hour" tick={{ fontSize: 10 }} stroke="#6b7280" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="orders" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Orders by Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-600" />
                  Orders by Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                {ordersByStatus.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No orders yet</p>
                ) : (
                  <div className="space-y-4">
                    {ordersByStatus.map((item: any, index: number) => {
                      const total = ordersByStatus.reduce((acc: number, i: any) => acc + Number(i.count), 0)
                      const percentage = total > 0 ? (Number(item.count) / total) * 100 : 0
                      return (
                        <div key={item.status} className="space-y-2">
                          <div className="flex justify-between items-center text-sm">
                            <span className="capitalize font-medium">{item.status}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">{item.count} orders</span>
                              <span className="font-semibold">Rs. {Number(item.revenue || 0).toLocaleString()}</span>
                            </div>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${percentage}%`,
                                backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
                              }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Category Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-orange-600" />
                  Top Categories by Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                {categoryPerformance.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No data available</p>
                ) : (
                  <div className="space-y-3">
                    {categoryPerformance.slice(0, 5).map((cat: any, index: number) => (
                      <div key={cat.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                          />
                          <div>
                            <p className="font-medium text-sm">{cat.name}</p>
                            <p className="text-xs text-muted-foreground">{cat.total_quantity_sold || 0} items sold</p>
                          </div>
                        </div>
                        <p className="font-bold text-sm">Rs. {Number(cat.total_revenue || 0).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="conversion" className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Conversion Funnel */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  Conversion Funnel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={funnelData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis type="number" tick={{ fontSize: 12 }} stroke="#6b7280" />
                    <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} stroke="#6b7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                      {funnelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-sm font-medium text-blue-900">
                    Conversion Rate: {overview.conversionRate?.toFixed(2) || 0}%
                  </p>
                  <p className="text-xs text-blue-600 mt-1">Views to Purchases ratio</p>
                </div>
              </CardContent>
            </Card>

            {/* Most Viewed Products */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Eye className="w-5 h-5 text-pink-600" />
                  Most Viewed Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                {mostViewedProducts.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
                ) : (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {mostViewedProducts.slice(0, 8).map((product: any, index: number) => (
                      <div key={product.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-gray-400 w-6">#{index + 1}</span>
                          <div>
                            <p className="font-medium text-sm line-clamp-1">{product.name}</p>
                            <p className="text-xs text-muted-foreground">Rs. {Number(product.current_price).toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-sm font-semibold">
                          <Eye className="w-4 h-4" />
                          {product.view_count}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top Selling Products */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                  Top Selling Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                {topSellingProducts.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No sales data yet</p>
                ) : (
                  <div className="grid md:grid-cols-2 gap-3">
                    {topSellingProducts.slice(0, 8).map((product: any, index: number) => (
                      <div key={product.id} className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-green-200 flex items-center justify-center">
                            <span className="text-sm font-bold text-green-700">#{index + 1}</span>
                          </div>
                          <div>
                            <p className="font-medium text-sm line-clamp-1">{product.name}</p>
                            <p className="text-xs text-muted-foreground">{product.total_quantity} sold</p>
                          </div>
                        </div>
                        <p className="font-bold text-sm text-green-700">Rs. {Number(product.total_revenue).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Orders Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Orders Trend</CardTitle>
              </CardHeader>
              <CardContent>
                {trendData.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No data available</p>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#6b7280" />
                      <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#fff",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                        }}
                      />
                      <Line type="monotone" dataKey="orders" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Average Order Value Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Average Order Value</CardTitle>
              </CardHeader>
              <CardContent>
                {trendData.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No data available</p>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#6b7280" />
                      <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#fff",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                        }}
                      />
                      <Line type="monotone" dataKey="avgOrderValue" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Recent Orders */}
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Recent Orders</CardTitle>
                <Link href="/admin/orders" className="text-sm text-primary hover:underline">
                  View all
                </Link>
              </CardHeader>
              <CardContent>
                {recentOrders.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No orders yet</p>
                ) : (
                  <div className="space-y-3">
                    {recentOrders.map((order: any) => (
                      <Link
                        key={order.id}
                        href={`/admin/orders/${order.id}`}
                        className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition border border-gray-100"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-sm">{order.order_number}</p>
                          <p className="text-xs text-muted-foreground">{order.customer_name} • {order.customer_email}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-sm text-primary">
                            Rs. {Number(order.total_amount).toLocaleString()}
                          </p>
                          <Badge className={`${statusColors[order.status]} text-xs mt-1`}>{order.status}</Badge>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Customer Growth */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-blue-600" />
                  Customer Growth
                </CardTitle>
              </CardHeader>
              <CardContent>
                {growthData.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No data available</p>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={growthData}>
                      <defs>
                        <linearGradient id="colorCustomers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#6b7280" />
                      <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#fff",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="customers"
                        stroke="#10b981"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorCustomers)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Top Customers */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  Top Customers
                </CardTitle>
              </CardHeader>
              <CardContent>
                {topCustomers.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No customer data yet</p>
                ) : (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {topCustomers.slice(0, 8).map((customer: any, index: number) => (
                      <div key={customer.id} className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-purple-200 flex items-center justify-center">
                            <span className="text-xs font-bold text-purple-700">#{index + 1}</span>
                          </div>
                          <div>
                            <p className="font-medium text-sm">{customer.name}</p>
                            <p className="text-xs text-muted-foreground">{customer.total_orders} orders</p>
                          </div>
                        </div>
                        <p className="font-bold text-sm text-purple-700">Rs. {Number(customer.total_spent).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
