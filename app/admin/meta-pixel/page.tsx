"use client"

import { useState, useEffect } from "react"
import useSWR from "swr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Save, AlertCircle, CheckCircle2, Activity, Settings } from "lucide-react"
import { toast } from "sonner"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function MetaPixelConfigPage() {
  const { data, isLoading, mutate } = useSWR("/api/admin/meta-pixel", fetcher)
  const { data: conversionStats } = useSWR("/api/analytics/conversion", fetcher)
  
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    pixel_id: "",
    access_token: "",
    test_event_code: "",
    is_active: false,
    enable_automatic_events: true,
    enable_advanced_matching: false,
  })

  // Update form data when API data loads
  useEffect(() => {
    if (data) {
      setFormData({
        pixel_id: data.pixel_id || "",
        access_token: data.access_token || "",
        test_event_code: data.test_event_code || "",
        is_active: data.is_active || false,
        enable_automatic_events: data.enable_automatic_events !== undefined ? data.enable_automatic_events : true,
        enable_advanced_matching: data.enable_advanced_matching || false,
      })
    }
  }, [data])

  const handleSave = async () => {
    if (!formData.pixel_id) {
      toast.error("Pixel ID is required")
      return
    }

    setSaving(true)
    try {
      const response = await fetch("/api/admin/meta-pixel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to save configuration")
      }

      toast.success("Meta Pixel configuration saved successfully")
      mutate()
    } catch (error) {
      console.error("Save error:", error)
      toast.error("Failed to save configuration")
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const stats = conversionStats?.stats || []
  const recentEvents = conversionStats?.recentEvents || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Meta Pixel & Conversion API</h1>
        <p className="text-gray-600">Configure Facebook/Meta Pixel and Conversion API for advanced tracking</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Configuration Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Configuration
            </CardTitle>
            <CardDescription>
              Set up your Meta Pixel ID and Conversion API credentials for server-side event tracking
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                To use Meta Pixel and Conversion API, you need to create a Facebook/Meta Pixel in your Meta Business
                Manager and obtain the Pixel ID and Access Token.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pixel_id">
                  Pixel ID <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="pixel_id"
                  placeholder="1234567890123456"
                  value={formData.pixel_id}
                  onChange={(e) => setFormData({ ...formData, pixel_id: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Your Meta Pixel ID from Meta Business Manager
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="access_token">Conversion API Access Token</Label>
                <Input
                  id="access_token"
                  type="password"
                  placeholder="EAAxxxxxxxxxxxxxxxxx"
                  value={formData.access_token}
                  onChange={(e) => setFormData({ ...formData, access_token: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Required for server-side event tracking via Conversion API
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="test_event_code">Test Event Code (Optional)</Label>
                <Input
                  id="test_event_code"
                  placeholder="TEST12345"
                  value={formData.test_event_code}
                  onChange={(e) => setFormData({ ...formData, test_event_code: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Use this to test events in Meta Events Manager before going live
                </p>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="is_active" className="font-semibold">
                      Enable Meta Pixel Tracking
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Activate Meta Pixel on your website
                    </p>
                  </div>
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enable_automatic_events" className="font-semibold">
                      Automatic Events
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Enable automatic tracking of PageView, ViewContent, etc.
                    </p>
                  </div>
                  <Switch
                    id="enable_automatic_events"
                    checked={formData.enable_automatic_events}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, enable_automatic_events: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enable_advanced_matching" className="font-semibold">
                      Advanced Matching
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Send hashed user data (email, phone) for better attribution
                    </p>
                  </div>
                  <Switch
                    id="enable_advanced_matching"
                    checked={formData.enable_advanced_matching}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, enable_advanced_matching: checked })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Configuration
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Status Card */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Pixel Status</span>
                {formData.is_active ? (
                  <Badge className="bg-green-100 text-green-700">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                ) : (
                  <Badge className="bg-gray-100 text-gray-700">Inactive</Badge>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Pixel ID</span>
                <span className="text-sm font-medium">
                  {formData.pixel_id ? `${formData.pixel_id.substring(0, 8)}...` : "Not set"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Conversion API</span>
                {formData.access_token ? (
                  <Badge className="bg-blue-100 text-blue-700">Configured</Badge>
                ) : (
                  <Badge className="bg-gray-100 text-gray-700">Not configured</Badge>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Advanced Matching</span>
                {formData.enable_advanced_matching ? (
                  <Badge className="bg-purple-100 text-purple-700">Enabled</Badge>
                ) : (
                  <Badge className="bg-gray-100 text-gray-700">Disabled</Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Event Stats (Last 30 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No events tracked yet</p>
              ) : (
                <div className="space-y-3">
                  {stats.map((stat: any) => (
                    <div key={stat.event_name} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <div>
                        <p className="font-medium text-sm">{stat.event_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {stat.sent_to_meta}/{stat.total_events} sent to Meta
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">{stat.total_events}</p>
                        {stat.total_value > 0 && (
                          <p className="text-xs text-muted-foreground">
                            Rs. {Number(stat.total_value).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Events */}
      {recentEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Conversion Events</CardTitle>
            <CardDescription>Latest tracked events sent to Meta Conversion API</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {recentEvents.slice(0, 10).map((event: any) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {event.event_name}
                      </Badge>
                      {event.sent_to_meta ? (
                        <Badge className="bg-green-100 text-green-700 text-xs">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Sent
                        </Badge>
                      ) : (
                        <Badge className="bg-yellow-100 text-yellow-700 text-xs">Pending</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(event.created_at).toLocaleString()}
                    </p>
                  </div>
                  {event.value && (
                    <p className="text-sm font-semibold">Rs. {Number(event.value).toLocaleString()}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Documentation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <ol className="space-y-3 text-sm">
            <li>
              <strong>Get your Pixel ID:</strong> Go to Meta Events Manager, select your Pixel, and copy the Pixel ID
            </li>
            <li>
              <strong>Generate Access Token:</strong> In Meta Business Settings, go to Events Manager → Settings →
              Conversions API → Generate Access Token
            </li>
            <li>
              <strong>Configure Settings:</strong> Enter your Pixel ID and Access Token above, then enable the features
              you want to use
            </li>
            <li>
              <strong>Test Events:</strong> Use the Test Event Code to verify events are being sent correctly in Meta
              Events Manager
            </li>
            <li>
              <strong>Go Live:</strong> Once testing is complete, remove the Test Event Code and enable tracking
            </li>
          </ol>
          <Alert className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Privacy Note:</strong> When Advanced Matching is enabled, user data (email, phone) is hashed
              (SHA256) before being sent to Meta for privacy compliance. No plain text data is transmitted.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}
