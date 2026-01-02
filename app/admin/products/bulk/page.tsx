"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ChevronLeft, Loader2, Upload, CheckCircle, AlertCircle } from "lucide-react"

const sampleCSV = `category_id,name,slug,description,short_description,original_price,current_price,stock_quantity,is_featured,is_new_arrival,image_url
1,Sample Product,sample-product,A great product description,Short desc,1000,899,50,false,true,https://example.com/images/sample-product.jpg`

export default function BulkUploadPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [csvData, setCsvData] = useState("")
  const [result, setResult] = useState<{ success: number; failed: number; errors: any[] } | null>(null)

  const parseCSV = (csv: string) => {
    const lines = csv.trim().split("\n")
    if (lines.length < 2) return []

    const headers = lines[0].split(",").map((h) => h.trim())
    const products = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim())
      const product: any = {}

      headers.forEach((header, index) => {
        let value: any = values[index]
        if (["category_id", "stock_quantity"].includes(header)) {
          value = Number.parseInt(value) || 0
        } else if (["original_price", "current_price"].includes(header)) {
          value = Number.parseFloat(value) || 0
        } else if (["is_featured", "is_new_arrival"].includes(header)) {
          value = value.toLowerCase() === "true"
        }
        product[header] = value
      })

      products.push(product)
    }

    return products
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setResult(null)

    const products = parseCSV(csvData)
    if (products.length === 0) {
      setResult({ success: 0, failed: 0, errors: [{ error: "No valid products found in CSV" }] })
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/products/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products }),
      })

      const data = await res.json()
      setResult({ success: data.success, failed: data.failed, errors: data.errors || [] })
    } catch (error: any) {
      setResult({ success: 0, failed: 0, errors: [{ error: error.message }] })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Bulk Upload</h1>
          <p className="text-muted-foreground">Upload multiple products at once using CSV format</p>
          <p className="text-xs text-muted-foreground">We will download each provided image URL and store a local copy in /uploads automatically.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>CSV Data</CardTitle>
            <CardDescription>
              Paste your CSV data below. First row should be headers. Existing products with the same slug will be
              updated.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Textarea
                value={csvData}
                onChange={(e) => setCsvData(e.target.value)}
                rows={15}
                placeholder="Paste CSV data here..."
                className="font-mono text-sm"
              />
              <div className="flex gap-2">
                <Button type="submit" disabled={loading || !csvData.trim()}>
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Products
                </Button>
                <Button type="button" variant="outline" onClick={() => setCsvData(sampleCSV)}>
                  Load Sample
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>CSV Format</CardTitle>
              <CardDescription>Required columns and format</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium">category_id:</span> Integer (1, 2, 3, etc.)
                </div>
                <div>
                  <span className="font-medium">name:</span> Product name
                </div>
                <div>
                  <span className="font-medium">slug:</span> URL-friendly identifier (unique)
                </div>
                <div>
                  <span className="font-medium">description:</span> Full description
                </div>
                <div>
                  <span className="font-medium">short_description:</span> Brief description
                </div>
                <div>
                  <span className="font-medium">original_price:</span> Original price
                </div>
                <div>
                  <span className="font-medium">current_price:</span> Current/sale price
                </div>
                <div>
                  <span className="font-medium">stock_quantity:</span> Available stock
                </div>
                <div>
                  <span className="font-medium">is_featured:</span> true or false
                </div>
                <div>
                  <span className="font-medium">is_new_arrival:</span> true or false
                </div>
                <div>
                  <span className="font-medium">image_url:</span> Direct image URL (the file is downloaded and saved locally)
                </div>
              </div>
            </CardContent>
          </Card>

          {result && (
            <Card>
              <CardHeader>
                <CardTitle>Upload Result</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">{result.success} successful</span>
                  </div>
                  {result.failed > 0 && (
                    <div className="flex items-center gap-2 text-destructive">
                      <AlertCircle className="w-5 h-5" />
                      <span className="font-medium">{result.failed} failed</span>
                    </div>
                  )}
                </div>
                {result.errors.length > 0 && (
                  <div className="space-y-2">
                    {result.errors.map((err, i) => (
                      <Alert key={i} variant="destructive">
                        <AlertDescription>
                          {err.product ? `${err.product}: ` : ""}
                          {err.error}
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
