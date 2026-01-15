"use client"

import { useState } from "react"
import Link from "next/link"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
  Smartphone,
  Monitor,
  Globe,
  ArrowUpRight,
  ArrowDown,
  ArrowUp,
  RefreshCw,
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
  PieChart as RechartsPieChart,
  Pie,
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

function StatCard({ title, value, icon, color, bgColor, trend }: {
  title: string
  value: string | number
  icon: React.ReactNode
  color: string
  bgColor: string
  trend?: string
}) {
  return (
    <Card className={`bg-gradient-to-br ${bgColor} border-gray-200 rounded-3xl shadow-sm hover:shadow-md transition-shadow`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className={`p-2 rounded-xl bg-white/50`}>
            <div className={color}>{icon}</div>
          </div>
          {trend && (
            <Badge className={`text-xs ${trend.startsWith('+') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {trend}
            </Badge>
          )}
        </div>
        <p className={`text-xs font-medium mt-3 ${color}`}>{title}</p>
        <p className={`text-lg font-bold ${color.replace('text-', 'text-').replace('-600', '-900')}`}>{value}</p>
      </CardContent>
    </Card>
  )
}

function ResetAnalyticsButton() {
  const [isResetting, setIsResetting] = useState(false)

  const handleReset = async () => {
    if (!confirm("Are you sure you want to reset all analytics data? This action cannot be undone.")) {
      return
    }

    setIsResetting(true)
    try {
      const response = await fetch("/api/analytics/reset", { method: "POST" })
      if (response.ok) {
        window.location.reload()
      } else {
        alert("Failed to reset analytics")
      }
    } catch (error) {
      alert("Error resetting analytics")
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleReset}
      disabled={isResetting}
      className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
    >
      {isResetting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
      Reset Analytics
    </Button>
  )
}

export default function UnifiedAdminDashboard() {
  const [period, setPeriod] = useState("7days")
  const { data, isLoading, mutate } = useSWR("/api/analytics/detailed", fetcher)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const overview = data?.overview || {}
  const dailyMetrics = data?.dailyMetrics || []
  const trafficByPage = data?.trafficByPage || []
  const deviceBreakdown = data?.deviceBreakdown || []
  const browserBreakdown = data?.browserBreakdown || []
  const topProducts = data?.topProducts || []
  const funnelStats = data?.funnelStats || []
  const ordersByStatus = data?.ordersByStatus || []
  const timeOfDayMetrics = data?.timeOfDayMetrics || []
  const recentHighValueOrders = data?.recentHighValueOrders || []

  // Calculate trends
  const todayRevenue = dailyMetrics[dailyMetrics.length - 1]?.revenue || 0
  const yesterdayRevenue = dailyMetrics[dailyMetrics.length - 2]?.revenue || 0
  const revenueTrend = yesterdayRevenue > 0 ? `${((todayRevenue - yesterdayRevenue) / yesterdayRevenue * 100).toFixed(1)}%` : "0%"

  const todayOrders = dailyMetrics[dailyMetrics.length - 1]?.orders || 0
  const yesterdayOrders = dailyMetrics[dailyMetrics.length - 2]?.orders || 0
  const ordersTrend = yesterdayOrders > 0 ? `${((todayOrders - yesterdayOrders) / yesterdayOrders * 100).toFixed(1)}%` : "0%"

  // Format data for charts
  const revenueData = dailyMetrics.map((day: any) => ({
    date: new Date(day.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    revenue: Number(day.revenue),
    orders: Number(day.orders),
    customers: Number(day.unique_customers),
  }))

  const hourlyData = Array.from({ length: 24 }, (_, i) => {
    const hourData = timeOfDayMetrics.find((h: any) => Number(h.hour) === i)
    return {
      hour: `${i}:00`,
      events: hourData ? Number(hourData.events) : 0,
      sessions: hourData ? Number(hourData.sessions) : 0,
    }
  })

  const deviceData = deviceBreakdown.map((device: any) => ({
    name: device.device_type,
    value: Number(device.events),
    percentage: Number(device.percentage),
  }))

  const browserData = browserBreakdown.map((browser: any) => ({
    name: browser.browser,
    value: Number(browser.events),
    percentage: Number(browser.percentage),
  }))

  const funnelData = funnelStats.map((stage: any) => ({
    name: stage.stage,
    value: Number(stage.count),
    fill: CHART_COLORS[funnelStats.indexOf(stage) % CHART_COLORS.length],
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Comprehensive analytics and business insights</p>
        </div>
        <div className="flex items-center gap-2">
          <ResetAnalyticsButton />
          <Button onClick={() => mutate()} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Revenue"
          value={`Rs. ${overview.totalRevenue?.toLocaleString() || 0}`}
          icon={<DollarSign className="w-5 h-5" />}
          color="text-blue-600"
          bgColor="from-blue-50 to-blue-100/50"
          trend={revenueTrend.startsWith('-') ? revenueTrend : `+${revenueTrend}`}
        />
        <StatCard
          title="Total Orders"
          value={overview.totalOrders || 0}
          icon={<ShoppingCart className="w-5 h-5" />}
          color="text-purple-600"
          bgColor="from-purple-50 to-purple-100/50"
          trend={ordersTrend.startsWith('-') ? ordersTrend : `+${ordersTrend}`}
        />
        <StatCard
          title="Customers"
          value={overview.totalUsers || 0}
          icon={<Users className="w-5 h-5" />}
          color="text-green-600"
          bgColor="from-green-50 to-green-100/50"
        />
        <StatCard
          title="Products"
          value={overview.totalProducts || 0}
          icon={<Package className="w-5 h-5" />}
          color="text-orange-600"
          bgColor="from-orange-50 to-orange-100/50"
        />
        <StatCard
          title="Avg Order Value"
          value={`Rs. ${Math.round(overview.avgOrderValue || 0)}`}
          icon={<TrendingUp className="w-5 h-5" />}
          color="text-indigo-600"
          bgColor="from-indigo-50 to-indigo-100/50"
        />
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="traffic">Traffic</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Revenue & Orders Trend */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Revenue & Orders Trend (Last 7 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {revenueData.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No data available</p>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={revenueData}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#6b7280" />
                      <YAxis yAxisId="left" tick={{ fontSize: 12 }} stroke="#6b7280" />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} stroke="#6b7280" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#fff",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                        }}
                      />
                      <Area
                        yAxisId="left"
                        type="monotone"
                        dataKey="revenue"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                        name="Revenue (Rs.)"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="orders"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        name="Orders"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Conversion Funnel */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-600" />
                  Conversion Funnel
                </CardTitle>
              </CardHeader>
              <CardContent>
                {funnelData.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No funnel data available</p>
                ) : (
                  <div className="space-y-4">
                    {funnelData.map((stage, index) => (
                      <div key={stage.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: stage.fill }}
                          />
                          <span className="text-sm font-medium">{stage.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold">{stage.value.toLocaleString()}</span>
                          {index > 0 && funnelData[index - 1] && (
                            <span className="text-xs text-muted-foreground ml-2">
                              ({((stage.value / funnelData[index - 1].value) * 100).toFixed(1)}%)
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Device Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-orange-600" />
                  Device Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                {deviceData.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No device data available</p>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <RechartsPieChart>
                      <Pie
                        data={deviceData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {deviceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                )}
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {deviceData.map((device, index) => (
                    <div key={device.name} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                      />
                      <span className="text-xs">{device.name}: {device.percentage}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent High-Value Orders */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent High-Value Orders</CardTitle>
              <Link href="/admin/orders" className="text-sm text-primary hover:underline">
                View all orders
              </Link>
            </CardHeader>
            <CardContent>
              {recentHighValueOrders.length === 0 ? (
                <p className="text-sm text-gray-600 text-center py-8">No orders yet</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentHighValueOrders.slice(0, 5).map((order: any) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          <Link href={`/admin/orders/${order.id}`} className="text-primary hover:underline">
                            {order.order_number}
                          </Link>
                        </TableCell>
                        <TableCell>{order.customer_name}</TableCell>
                        <TableCell>{order.item_count}</TableCell>
                        <TableCell className="font-medium">Rs. {Number(order.total_amount).toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge className={`${statusColors[order.status]} text-xs`}>{order.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                  Daily Revenue (Last 7 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#6b7280" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                      }}
                      formatter={(value) => [`Rs. ${Number(value).toLocaleString()}`, "Revenue"]}
                    />
                    <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Orders by Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Orders by Status</CardTitle>
              </CardHeader>
              <CardContent>
                {ordersByStatus.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No order data available</p>
                ) : (
                  <div className="space-y-3">
                    {ordersByStatus.map((status: any) => (
                      <div key={status.status} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge className={`${statusColors[status.status]} text-xs`}>{status.status}</Badge>
                          <span className="text-sm font-medium capitalize">{status.status}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold">{status.count}</span>
                          <span className="text-xs text-muted-foreground ml-2">({status.percentage}%)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Revenue Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Revenue Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium">Total Revenue</span>
                    <span className="text-lg font-bold text-blue-600">Rs. {overview.totalRevenue?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-sm font-medium">Average Order Value</span>
                    <span className="text-lg font-bold text-green-600">Rs. {Math.round(overview.avgOrderValue || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <span className="text-sm font-medium">Today's Revenue</span>
                    <span className="text-lg font-bold text-purple-600">Rs. {(revenueData[revenueData.length - 1]?.revenue || 0).toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Traffic Tab */}
        <TabsContent value="traffic" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Traffic by Page */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-600" />
                  Top Pages (Last 7 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {trafficByPage.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No traffic data available</p>
                ) : (
                  <div className="space-y-3">
                    {trafficByPage.map((page: any, index: number) => (
                      <div key={page.page_url} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-gray-400 w-6">#{index + 1}</span>
                          <div>
                            <p className="text-sm font-medium truncate max-w-48">{page.page_url}</p>
                            <p className="text-xs text-muted-foreground">{page.sessions} sessions</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">{page.views.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">views</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Hourly Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-600" />
                  Hourly Activity (Last 7 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
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
                    <Bar dataKey="events" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Browser Breakdown */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Monitor className="w-5 h-5 text-green-600" />
                  Browser Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                {browserData.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No browser data available</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {browserData.map((browser, index) => (
                      <div key={browser.name} className="text-center p-4 bg-gray-50 rounded-lg">
                        <div
                          className="w-8 h-8 rounded-full mx-auto mb-2"
                          style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                        />
                        <p className="text-sm font-medium">{browser.name}</p>
                        <p className="text-lg font-bold">{browser.percentage}%</p>
                        <p className="text-xs text-muted-foreground">{browser.value.toLocaleString()} events</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="w-5 h-5 text-orange-600" />
                Top Performing Products (Last 30 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topProducts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No product data available</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead>Unique Viewers</TableHead>
                      <TableHead>Add to Cart</TableHead>
                      <TableHead>Add to Wishlist</TableHead>
                      <TableHead>Conversion Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topProducts.map((product: any) => {
                      const conversionRate = product.views > 0 ? ((product.add_to_cart / product.views) * 100).toFixed(1) : 0
                      return (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">
                            <Link href={`/product/${product.id}`} className="text-primary hover:underline">
                              {product.name}
                            </Link>
                          </TableCell>
                          <TableCell>{product.views.toLocaleString()}</TableCell>
                          <TableCell>{product.unique_viewers.toLocaleString()}</TableCell>
                          <TableCell>{product.add_to_cart.toLocaleString()}</TableCell>
                          <TableCell>{product.add_to_wishlist.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-700">{conversionRate}%</Badge>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Orders Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-purple-600" />
                  Daily Orders (Last 7 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={revenueData}>
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
                    <Line
                      type="monotone"
                      dataKey="orders"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                      dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Order Status Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Order Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsPieChart>
                    <Pie
                      data={ordersByStatus}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="count"
                      nameKey="status"
                    >
                      {ordersByStatus.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {ordersByStatus.map((status: any, index: number) => (
                    <div key={status.status} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                      />
                      <span className="text-xs capitalize">{status.status}: {status.percentage}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent High-Value Orders Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent High-Value Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentHighValueOrders.map((order: any) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        <Link href={`/admin/orders/${order.id}`} className="text-primary hover:underline">
                          {order.order_number}
                        </Link>
                      </TableCell>
                      <TableCell>{order.customer_name}</TableCell>
                      <TableCell>{order.item_count}</TableCell>
                      <TableCell className="font-medium">Rs. {Number(order.total_amount).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={`${statusColors[order.status]} text-xs`}>{order.status}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
