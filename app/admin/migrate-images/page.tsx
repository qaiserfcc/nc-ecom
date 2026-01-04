"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"

export default function MigrateImagesPage() {
  const [status, setStatus] = useState<"idle" | "checking" | "migrating" | "done">("checking")
  const [stats, setStats] = useState({ products: 0, productImages: 0, total: 0 })
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    checkMigrationStatus()
  }, [])

  const checkMigrationStatus = async () => {
    try {
      const response = await fetch("/api/admin/migrate-images-to-blob")
      const data = await response.json()

      if (data.itemsToMigrate) {
        setStats(data.itemsToMigrate)
      }
      setStatus("idle")
    } catch (err) {
      setError("Failed to check migration status")
      setStatus("idle")
    }
  }

  const startMigration = async (type: "all" | "products" | "product_images") => {
    setStatus("migrating")
    setError("")

    try {
      const response = await fetch(`/api/admin/migrate-images-to-blob?type=${type}`, {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
        setStatus("done")
        // Refresh stats
        setTimeout(checkMigrationStatus, 1000)
      } else {
        setError(data.details || "Migration failed")
        setStatus("idle")
      }
    } catch (err) {
      setError("Migration request failed: " + String(err))
      setStatus("idle")
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Migrate Images to Vercel Blob</h1>

      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Migration Status</h2>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded">
            <p className="text-sm text-gray-600">Products</p>
            <p className="text-2xl font-bold text-blue-600">{stats.products}</p>
          </div>
          <div className="bg-green-50 p-4 rounded">
            <p className="text-sm text-gray-600">Product Images</p>
            <p className="text-2xl font-bold text-green-600">{stats.productImages}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded">
            <p className="text-sm text-gray-600">Total to Migrate</p>
            <p className="text-2xl font-bold text-purple-600">{stats.total}</p>
          </div>
        </div>

        {stats.total === 0 ? (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              All images have been migrated! No action needed.
            </AlertDescription>
          </Alert>
        ) : (
          <p className="text-gray-600 mb-6">
            {stats.total} images are still stored in /uploads/ and can be migrated to Vercel Blob for better performance.
          </p>
        )}
      </Card>

      {error && (
        <Alert className="bg-red-50 border-red-200 mb-6">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <Card className="p-6 mb-6 bg-green-50 border-green-200">
          <h3 className="font-semibold text-green-900 mb-3">Migration Completed ✓</h3>
          <div className="space-y-2 text-sm text-green-800">
            <p>✓ Migrated: {result.stats.migratedCount} images</p>
            <p>• Skipped: {result.stats.skippedCount} images</p>
            {result.stats.errorCount > 0 && (
              <>
                <p>⚠ Errors: {result.stats.errorCount}</p>
                {result.errors && (
                  <div className="mt-2 text-xs bg-white p-2 rounded border border-red-200">
                    {result.errors.map((e: string, i: number) => (
                      <div key={i}>{e}</div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </Card>
      )}

      <div className="space-y-3">
        <p className="text-sm text-gray-600 mb-4">
          Choose what to migrate. Safe to run multiple times - already migrated images won't be re-uploaded.
        </p>

        <Button
          onClick={() => startMigration("all")}
          disabled={status === "migrating" || stats.total === 0}
          className="w-full"
          size="lg"
        >
          {status === "migrating" && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {status === "migrating" ? "Migrating..." : "Migrate All Images"}
        </Button>

        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => startMigration("products")}
            disabled={status === "migrating" || stats.products === 0}
            variant="outline"
          >
            {status === "migrating" && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Migrate Products ({stats.products})
          </Button>

          <Button
            onClick={() => startMigration("product_images")}
            disabled={status === "migrating" || stats.productImages === 0}
            variant="outline"
          >
            {status === "migrating" && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Migrate Product Images ({stats.productImages})
          </Button>
        </div>
      </div>

      <Alert className="mt-6">
        <AlertDescription>
          <p className="font-semibold mb-2">How it works:</p>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>Finds all images stored locally in /uploads/</li>
            <li>Re-uploads them to Vercel Blob</li>
            <li>Updates database URLs to point to Blob storage</li>
            <li>Safe to run multiple times</li>
            <li>Existing images continue to work during migration</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  )
}
