"use client"

import useSWR from "swr"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, Eye, TrendingUp, Users, ShoppingCart, DollarSign, ArrowUpRight, Smartphone, Monitor, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function AdminAnalyticsPage() {
  const { data, isLoading } = useSWR("/api/analytics/detailed", fetcher)

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
  const topCities = data?.topCities || []
  const timeOfDayMetrics = data?.timeOfDayMetrics || []
  const recentHighValueOrders = data?.recentHighValueOrders || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground">Real-time performance metrics & insights</p>
        <div className="mt-3 flex items-center gap-3 flex-wrap">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            ✓ Domain: www.namecheap.to
          </Badge>
          <ResetAnalyticsButton />
        </div>
      </div>

      {/* Primary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={`Rs. ${overview.totalRevenue?.toLocaleString() || 0}`}
          icon={<DollarSign className="w-5 h-5" />}
          color="text-primary"
          bgColor="bg-primary/10"
        />
        <StatCard
          title="Total Orders"
          value={overview.totalOrders || 0}
          icon={<ShoppingCart className="w-5 h-5" />}
          color="text-blue-600"
          bgColor="bg-blue-50"
        />
        <StatCard
          title="Customers"
          value={overview.totalUsers || 0}
          icon={<Users className="w-5 h-5" />}
          color="text-green-600"
          bgColor="bg-green-50"
        />
        <StatCard
          title="Avg Order Value"
          value={`Rs. ${Math.round(overview.avgOrderValue || 0).toLocaleString()}`}
          icon={<TrendingUp className="w-5 h-5" />}
          color="text-orange-600"
          bgColor="bg-orange-50"
        />
      </div>

      {/* Tabs for Different Views */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="traffic">Traffic</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Revenue & Orders Chart */}
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Revenue & Orders (Last 7 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                {dailyMetrics.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-12">No data yet</p>
                ) : (
                  <div className="space-y-6">
                    {/* Revenue Chart */}
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-3">Daily Revenue</p>
                      <div className="flex items-end gap-1 h-40">
                        {dailyMetrics.map((day: any) => {
                          const maxRevenue = Math.max(...dailyMetrics.map((d: any) => Number(d.revenue)))
                          const height = maxRevenue > 0 ? (Number(day.revenue) / maxRevenue) * 100 : 0
                          return (
                            <div
                              key={day.date}
                              className="flex-1 group relative"
                              title={`${new Date(day.date).toLocaleDateString()}: Rs. ${Number(day.revenue).toLocaleString()}`}
                            >
                              <div className="h-full bg-gradient-to-t from-primary to-primary/60 rounded-t opacity-70 hover:opacity-100 transition-opacity" style={{ height: `${Math.max(height, 8)}%` }} />
                              <div className="text-center mt-2">
                                <p className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                                  {new Date(day.date).toLocaleDateString("en-US", { weekday: "short" })}
                                </p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Orders Chart */}
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-3">Daily Orders</p>
                      <div className="flex items-end gap-1 h-32">
                        {dailyMetrics.map((day: any) => {
                          const maxOrders = Math.max(...dailyMetrics.map((d: any) => Number(d.orders)))
                          const height = maxOrders > 0 ? (Number(day.orders) / maxOrders) * 100 : 0
                          return (
                            <div key={day.date} className="flex-1" style={{ height: `${Math.max(height, 8)}%` }}>
                              <div className="h-full w-full bg-gradient-to-t from-blue-400 to-blue-500 rounded-t hover:from-blue-500 hover:to-blue-600 transition-all" />
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Conversion Funnel */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Conversion Funnel (Last 7 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              {funnelStats.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
              ) : (
                <div className="space-y-4">
                  {funnelStats.map((stage: any, idx: number) => {
                    const maxCount = funnelStats[0]?.count || 1
                    const percentage = (Number(stage.count) / maxCount) * 100
                    const conversionRate = idx > 0 ? ((Number(stage.count) / Number(funnelStats[idx - 1].count)) * 100).toFixed(1) : 100
                    
                    return (
                      <div key={stage.stage} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                              {idx + 1}
                            </span>
                            {stage.stage}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {Number(stage.count).toLocaleString()} <span className="text-primary font-semibold">({conversionRate}%)</span>
                          </span>
                        </div>
                        <div className="h-3 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
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
              <CardTitle className="text-lg">Orders by Status (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              {ordersByStatus.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No orders yet</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {ordersByStatus.map((item: any) => {
                    const colors: Record<string, string> = {
                      pending: "bg-yellow-100 text-yellow-800",
                      processing: "bg-blue-100 text-blue-800",
                      shipped: "bg-purple-100 text-purple-800",
                      delivered: "bg-green-100 text-green-800",
                      cancelled: "bg-red-100 text-red-800",
                    }
                    return (
                      <div key={item.status} className={`p-4 rounded-lg ${colors[item.status] || "bg-gray-100 text-gray-800"}`}>
                        <p className="text-xs font-medium opacity-75 capitalize">{item.status}</p>
                        <p className="text-2xl font-bold mt-1">{item.count}</p>
                        <p className="text-xs mt-1">{item.percentage}%</p>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Traffic Tab */}
        <TabsContent value="traffic" className="space-y-6">
          {/* Device & Browser Breakdown */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  Device Breakdown (Last 7 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {deviceBreakdown.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
                ) : (
                  <div className="space-y-4">
                    {deviceBreakdown.map((device: any) => (
                      <div key={device.device_type} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize font-medium">{device.device_type}</span>
                          <span className="text-xs text-muted-foreground">{device.percentage}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full"
                            style={{ width: `${device.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Monitor className="w-4 h-4" />
                  Browser Breakdown (Last 7 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {browserBreakdown.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
                ) : (
                  <div className="space-y-4">
                    {browserBreakdown.map((browser: any) => (
                      <div key={browser.browser} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize font-medium">{browser.browser}</span>
                          <span className="text-xs text-muted-foreground">{browser.percentage}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-secondary to-secondary/60 rounded-full"
                            style={{ width: `${browser.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Top Pages */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Top Pages (Last 7 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {trafficByPage.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
              ) : (
                <div className="space-y-3">
                  {trafficByPage.map((page: any, idx: number) => {
                    const maxViews = trafficByPage[0]?.views || 1
                    const percentage = (Number(page.views) / maxViews) * 100
                    return (
                      <div key={page.page_url} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium truncate flex items-center gap-2 flex-1">
                            <Badge variant="secondary" className="shrink-0">{idx + 1}</Badge>
                            <span className="truncate text-xs">{page.page_url || "/"}</span>
                          </span>
                          <div className="text-right text-xs text-muted-foreground shrink-0 ml-2">
                            <div>{Number(page.views).toLocaleString()} views</div>
                            <div className="text-[10px]">{Number(page.sessions).toLocaleString()} sessions</div>
                          </div>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Time of Day Heatmap */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Hourly Traffic Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {timeOfDayMetrics.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
              ) : (
                <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-2">
                  {Array.from({ length: 24 }).map((_, hour) => {
                    const metric = timeOfDayMetrics.find((m: any) => m.hour === hour)
                    const maxEvents = Math.max(...timeOfDayMetrics.map((m: any) => m.events))
                    const intensity = metric ? (metric.events / maxEvents) * 100 : 0
                    return (
                      <div
                        key={hour}
                        className="aspect-square rounded flex flex-col items-center justify-center text-xs font-semibold text-white cursor-pointer hover:shadow-lg transition-shadow"
                        style={{
                          backgroundColor: `rgba(59, 130, 246, ${Math.max(0.1, intensity / 100)})`,
                        }}
                        title={`${hour}:00 - ${metric?.events || 0} events`}
                      >
                        {hour}
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Top Products (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              {topProducts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">#</TableHead>
                        <TableHead>Product Name</TableHead>
                        <TableHead className="text-center">Views</TableHead>
                        <TableHead className="text-center">Unique Viewers</TableHead>
                        <TableHead className="text-center">Add to Cart</TableHead>
                        <TableHead className="text-center">Wishlist</TableHead>
                        <TableHead className="text-center">CTR</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topProducts.map((product: any, idx: number) => {
                        const ctr = product.views > 0 ? ((product.add_to_cart / product.views) * 100).toFixed(1) : 0
                        return (
                          <TableRow key={product.id}>
                            <TableCell>
                              <Badge variant="outline">{idx + 1}</Badge>
                            </TableCell>
                            <TableCell className="font-medium max-w-xs truncate">{product.name}</TableCell>
                            <TableCell className="text-center">{product.views}</TableCell>
                            <TableCell className="text-center text-muted-foreground text-sm">{product.unique_viewers}</TableCell>
                            <TableCell className="text-center">
                              <Badge variant="secondary">{product.add_to_cart}</Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline">{product.add_to_wishlist}</Badge>
                            </TableCell>
                            <TableCell className="text-center font-semibold text-primary">{ctr}%</TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Cities */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Top Cities by Orders (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              {topCities.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
              ) : (
                <div className="space-y-3">
                  {topCities.map((city: any, idx: number) => {
                    const maxOrders = topCities[0]?.orders || 1
                    const percentage = (Number(city.orders) / maxOrders) * 100
                    return (
                      <div key={city.city} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium flex items-center gap-2">
                            <Badge variant="secondary">{idx + 1}</Badge>
                            {city.city || "Unknown"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {city.orders} orders • Rs. {Number(city.revenue).toLocaleString()}
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">High-Value Orders (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              {recentHighValueOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No orders yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order #</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentHighValueOrders.map((order: any) => {
                        const statusColors: Record<string, string> = {
                          pending: "bg-yellow-100 text-yellow-800",
                          processing: "bg-blue-100 text-blue-800",
                          shipped: "bg-purple-100 text-purple-800",
                          delivered: "bg-green-100 text-green-800",
                          cancelled: "bg-red-100 text-red-800",
                        }
                        return (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium">{order.order_number}</TableCell>
                            <TableCell>{order.customer_name}</TableCell>
                            <TableCell className="text-center">{order.item_count}</TableCell>
                            <TableCell className="text-right font-semibold">Rs. {Number(order.total_amount).toLocaleString()}</TableCell>
                            <TableCell>
                              <Badge className={statusColors[order.status] || "bg-gray-100 text-gray-800"}>
                                {order.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {new Date(order.created_at).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon,
  color,
  bgColor,
}: {
  title: string
  value: string | number
  icon: React.ReactNode
  color: string
  bgColor: string
}) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4 lg:p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs lg:text-sm text-muted-foreground mb-1">{title}</p>
            <p className="text-lg lg:text-2xl font-bold">{value}</p>
          </div>
          <div className={`p-2 lg:p-3 rounded-lg ${bgColor}`}>
            <div className={color}>{icon}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ResetAnalyticsButton() {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<string | null>(null)

  const handleReset = async () => {
    setLoading(true)
    setStatus(null)
    try {
      const res = await fetch("/api/analytics/reset", { method: "POST" })
      if (!res.ok) throw new Error("Failed to reset analytics")
      setStatus("Reset complete. Tracking from today.")
    } catch (e) {
      setStatus("Reset failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={handleReset} disabled={loading}>
        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
        Reset Analytics
      </Button>
      {status && <span className="text-xs text-muted-foreground">{status}</span>}
    </div>
  )
}
