"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { toast } from "sonner"

export default function MetaPixelInitPage() {
  const [loading, setLoading] = useState(false)
  const [initialized, setInitialized] = useState(false)

  const handleInitialize = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/meta-pixel/init", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pixel_id: "932014878052619",
          access_token:
            "EAAWcOaIQDsEBQfVCS3wU1K4zpLZB4bRwQZBRIUrtlZAFMr7HtUliWWmSt8rqCz95bRz3fQZCbX0TolZBgpBpvu42lM8lhaOv7n8scjazNcENBFqj440vjkbkAHENhZBo43LE4s4fpxk3jZAxGqzvNnesZAXaZCPrB8WQijU1TGwPEFLWtEmUmMyzyU7iNGKJmcAZDZD",
          test_event_code: "TEST15893",
          is_active: true,
          enable_automatic_events: true,
          enable_advanced_matching: true,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to initialize")
      }

      const data = await response.json()
      setInitialized(true)
      toast.success("✓ Meta Pixel configuration saved and activated!")
    } catch (error) {
      console.error("Init error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to initialize")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Meta Pixel Setup</h1>
        <p className="text-muted-foreground">Initialize Meta Pixel configuration with default credentials</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {initialized ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                Configuration Complete
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 text-blue-600" />
                Ready to Initialize
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert className={initialized ? "bg-green-50 border-green-200" : "bg-blue-50 border-blue-200"}>
            <AlertDescription className="text-sm">
              {initialized ? (
                <div className="space-y-2">
                  <p className="font-semibold text-green-700">✓ Configuration Saved Successfully!</p>
                  <p className="text-green-700">
                    Your Meta Pixel credentials are now saved in the database and will be loaded automatically on next
                    visit.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="font-semibold text-blue-700">Configure Meta Pixel Settings</p>
                  <p className="text-blue-700">Click the button below to save the following credentials to your database:</p>
                  <ul className="mt-3 space-y-2 text-sm text-blue-700 ml-4">
                    <li>• <strong>Pixel ID:</strong> 932014878052619</li>
                    <li>• <strong>Access Token:</strong> EAAWcOaIQDsEB... (securely stored)</li>
                    <li>• <strong>Test Event Code:</strong> TEST15893</li>
                    <li>• <strong>Status:</strong> Active + Automatic Events + Advanced Matching</li>
                  </ul>
                </div>
              )}
            </AlertDescription>
          </Alert>

          {!initialized && (
            <Button onClick={handleInitialize} disabled={loading} size="lg" className="w-full">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving Configuration...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Save Meta Pixel Configuration
                </>
              )}
            </Button>
          )}

          {initialized && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-700 mb-2">Configuration Details:</h3>
                <div className="space-y-2 text-sm text-green-700">
                  <div className="flex justify-between">
                    <span>Pixel ID:</span>
                    <code className="bg-green-100 px-2 py-1 rounded">932014878052619</code>
                  </div>
                  <div className="flex justify-between">
                    <span>Test Event Code:</span>
                    <code className="bg-green-100 px-2 py-1 rounded">TEST15893</code>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <Badge className="bg-green-600">Active</Badge>
                  </div>
                </div>
              </div>

              <Button onClick={() => (window.location.href = "/admin/meta-pixel")} className="w-full" variant="outline">
                Go to Meta Pixel Settings
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">What's Next?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <p className="font-semibold mb-1">1. Configuration Saved ✓</p>
            <p className="text-muted-foreground">Your Meta Pixel settings are now saved in the database.</p>
          </div>
          <div>
            <p className="font-semibold mb-1">2. Auto-Load on Visit ✓</p>
            <p className="text-muted-foreground">
              The next time you visit the Meta Pixel settings page, these credentials will be automatically loaded from the database.
            </p>
          </div>
          <div>
            <p className="font-semibold mb-1">3. Configure Analytics</p>
            <p className="text-muted-foreground">
              Go to Meta Pixel settings to view the loaded configuration, enable features, and adjust settings as needed.
            </p>
          </div>
          <div>
            <p className="font-semibold mb-1">4. Monitor Events</p>
            <p className="text-muted-foreground">
              View tracked events in the Meta Events Manager dashboard to ensure tracking is working correctly.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
