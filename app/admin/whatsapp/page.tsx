"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { MessageCircle, TrendingUp, Clock, ShoppingCart, Download } from "lucide-react"

interface MetricsSummary {
  summary: {
    totalMessages: number
    averageResponseTime: number
    orderCreated: number
    notificationsSent: number
  }
  byDirection: Array<{ direction: string; count: number }>
  byEventType: Array<{ event_type: string; count: number }>
  dailyVolume: Array<{ date: string; count: number }>
}

interface WhatsAppLog {
  id: number
  event_type: string
  message_id: string
  from_number: string
  to_number: string
  message_body: string
  direction: string
  status: string
  created_at: string
}

export default function WhatsAppMetricsPage() {
  const [metrics, setMetrics] = useState<MetricsSummary | null>(null)
  const [logs, setLogs] = useState<WhatsAppLog[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("summary")

  useEffect(() => {
    fetchMetrics()
    if (activeTab === "logs") {
      fetchLogs()
    }
  }, [activeTab])

  const fetchMetrics = async () => {
    try {
      const response = await fetch("/api/whatsapp/metrics?type=summary")
      const data = await response.json()
      setMetrics(data)
    } catch (error) {
      console.error("Error fetching metrics:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchLogs = async () => {
    try {
      const response = await fetch("/api/whatsapp/metrics?type=logs&limit=50")
      const data = await response.json()
      setLogs(data.logs || [])
    } catch (error) {
      console.error("Error fetching logs:", error)
    }
  }

  const exportCSV = async () => {
    try {
      const response = await fetch("/api/whatsapp/metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString(),
        }),
      })

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `whatsapp-logs-${new Date().toISOString().split("T")[0]}.csv`
      a.click()
    } catch (error) {
      console.error("Error exporting CSV:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading WhatsApp metrics...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">WhatsApp Analytics</h1>
          <p className="text-muted-foreground mt-2">
            Monitor customer interactions and order management via WhatsApp
          </p>
        </div>
        <Button onClick={exportCSV} variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <MessageCircle className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.summary.totalMessages || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics?.byDirection.find((d) => d.direction === "inbound")?.count || 0} inbound,{" "}
              {metrics?.byDirection.find((d) => d.direction === "outbound")?.count || 0} outbound
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((metrics?.summary.averageResponseTime || 0) / 60)}m
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics?.summary.averageResponseTime || 0} seconds average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Orders Created</CardTitle>
            <ShoppingCart className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.summary.orderCreated || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Via WhatsApp messages</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Notifications Sent</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.summary.notificationsSent || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Order status updates</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for detailed views */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="logs">Message Logs</TabsTrigger>
          <TabsTrigger value="events">Event Types</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Daily Message Volume</CardTitle>
                <CardDescription>Last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {metrics?.dailyVolume.slice(0, 10).map((day) => (
                    <div key={day.date} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {new Date(day.date).toLocaleDateString()}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{
                              width: `${(day.count / (metrics?.dailyVolume[0]?.count || 1)) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium w-8 text-right">{day.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Message Direction</CardTitle>
                <CardDescription>Inbound vs Outbound</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics?.byDirection.map((dir) => (
                    <div key={dir.direction} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium capitalize">{dir.direction}</span>
                        <span className="text-sm text-muted-foreground">{dir.count}</span>
                      </div>
                      <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{
                            width: `${(dir.count / (metrics?.summary.totalMessages || 1)) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Recent Messages</CardTitle>
              <CardDescription>Last 50 WhatsApp interactions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Direction</TableHead>
                    <TableHead>From/To</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm">
                        {new Date(log.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            log.direction === "inbound"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {log.direction}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">
                        {log.direction === "inbound" ? log.from_number : log.to_number}
                      </TableCell>
                      <TableCell className="text-sm max-w-md truncate">
                        {log.message_body || "-"}
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">
                          {log.status || "-"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>Event Types</CardTitle>
              <CardDescription>Breakdown by event category</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event Type</TableHead>
                    <TableHead>Count</TableHead>
                    <TableHead>Percentage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metrics?.byEventType.map((event) => (
                    <TableRow key={event.event_type}>
                      <TableCell className="font-medium">{event.event_type}</TableCell>
                      <TableCell>{event.count}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{
                                width: `${(event.count / (metrics?.summary.totalMessages || 1)) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {((event.count / (metrics?.summary.totalMessages || 1)) * 100).toFixed(
                              1
                            )}
                            %
                          </span>
                        </div>
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
